import { renderHook, act, waitFor } from '@testing-library/react';
import { useVoteHandlers } from '../hooks/useVoteHandlers';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

describe('useVoteHandlers', () => {
  let mockSocket: any;
  let setError: any;
  let setSuccess: any;
  let setUserVote: any;

  const mockIssue = {
    id: 'issue-1',
    key: 'TEST-1',
    fields: {
      status: { name: 'To Do' },
      assignee: { displayName: 'John' },
    },
  };

  const mockParticipants = [
    { id: 'user-1', name: 'Alice', hasVoted: true, vote: '5' },
    { id: 'user-2', name: 'Bob', hasVoted: true, vote: '8' },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };

    setError = jest.fn();
    setSuccess = jest.fn();
    setUserVote = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: null,
        revealedVotes: false,
        participants: [],
        setError,
        setSuccess,
        setUserVote,
      })
    );

    expect(result.current.selectedVoteOption).toBeNull();
    expect(result.current.minVote).toBeNull();
    expect(result.current.maxVote).toBeNull();
    expect(result.current.avgVote).toBeNull();
  });

  it('should calculate vote statistics correctly', () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: true,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    expect(result.current.minVote).toBe('5');
    expect(result.current.maxVote).toBe('8');
    // Votes: 5 (index 4) + 8 (index 6) = avg index 5 = '8'
    expect(result.current.avgVote).toBe('8');
  });

  it('should emit vote event when handleVote is called', () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: false,
        participants: [],
        setError,
        setSuccess,
        setUserVote,
      })
    );

    act(() => {
      result.current.handleVote('13');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('vote', 'session-1', '13');
    expect(setUserVote).toHaveBeenCalledWith('13');
  });

  it('should emit reveal-votes event', () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: false,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    act(() => {
      result.current.handleRevealVotes();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('reveal-votes', 'session-1');
  });

  it('should emit reset-votes event and clear user vote', () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: true,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    act(() => {
      result.current.handleResetVotes();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('reset-votes', 'session-1');
    expect(setUserVote).toHaveBeenCalledWith(null);
  });

  it('should handle min vote selection', async () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: true,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    mockSocket.emit.mockImplementation((event: string, ...args: any[]) => {
      if (event === 'update-issue-estimation') {
        const callback = args[args.length - 1];
        callback({ success: true });
      }
    });

    act(() => {
      result.current.handleConfirmEstimation('min');
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'update-issue-estimation',
        'session-1',
        'issue-1',
        expect.any(String),
        expect.any(Function)
      );
      expect(setSuccess).toHaveBeenCalled();
    });
  });

  it('should handle manual vote entry', async () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: true,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    mockSocket.emit.mockImplementation((event: string, ...args: any[]) => {
      if (event === 'update-issue-estimation') {
        const callback = args[args.length - 1];
        callback({ success: true });
      }
    });

    act(() => {
      result.current.handleConfirmEstimation('manual', '16');
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'update-issue-estimation',
        'session-1',
        'issue-1',
        '16',
        expect.any(Function)
      );
    });
  });

  it('should handle estimation update error', async () => {
    const { result } = renderHook(() =>
      useVoteHandlers({
        socket: mockSocket,
        sessionId: 'session-1',
        currentIssue: mockIssue,
        revealedVotes: true,
        participants: mockParticipants,
        setError,
        setSuccess,
        setUserVote,
      })
    );

    mockSocket.emit.mockImplementation((event: string, ...args: any[]) => {
      if (event === 'update-issue-estimation') {
        const callback = args[args.length - 1];
        callback({ success: false, error: 'Network error' });
      }
    });

    act(() => {
      result.current.handleConfirmEstimation('avg');
    });

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith('Network error');
    });
  });
});
