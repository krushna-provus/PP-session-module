import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionState } from '../hooks/useSessionState';

describe('useSessionState', () => {
  let mockSocket: any;
  let getSessionCallback: any;

  const mockInitialSession = {
    participants: [{ id: 'user-1', name: 'Alice', hasVoted: false }],
    currentStory: 'Test story',
    currentIssue: null,
    isVotingOpen: true,
    revealedVotes: false,
  };

  beforeEach(() => {
    getSessionCallback = null;

    mockSocket = {
      emit: jest.fn((event: string, ...args: any[]) => {
        if (event === 'get-session') {
          const callback = args[args.length - 1];
          getSessionCallback = callback;
          callback({ success: true, session: mockInitialSession });
        }
      }),
      on: jest.fn(),
      off: jest.fn(),
    };
  });

  it('should initialize with initial session data', () => {
    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocket,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    expect(result.current.participants).toHaveLength(1);
    expect(result.current.currentStory).toBe('Test story');
    expect(result.current.isVotingOpen).toBe(true);
    expect(result.current.revealedVotes).toBe(false);
  });

  it('should initialize with empty state if no initial session', () => {
    const emptyMockSocket = {
      emit: jest.fn((event: string, ...args: any[]) => {
        if (event === 'get-session') {
          const callback = args[args.length - 1];
          callback({ success: true, session: { participants: [], currentStory: '', currentIssue: null, isVotingOpen: false, revealedVotes: false } });
        }
      }),
      on: jest.fn(),
      off: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionState({
        socket: emptyMockSocket,
        sessionId: 'session-1',
        userName: 'Bob',
      })
    );

    expect(result.current.participants).toEqual([]);
    expect(result.current.currentStory).toBe('');
    expect(result.current.isVotingOpen).toBe(false);
    expect(result.current.revealedVotes).toBe(false);
  });

  it('should update session state when session-updated event is received', async () => {
    let sessionUpdatedHandler: any = null;

    const mockSocketWithListener = {
      emit: jest.fn((event: string, ...args: any[]) => {
        if (event === 'get-session') {
          const callback = args[args.length - 1];
          callback({ success: true, session: mockInitialSession });
        }
      }),
      on: jest.fn((event: string, handler: any) => {
        if (event === 'session-updated') {
          sessionUpdatedHandler = handler;
        }
      }),
      off: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocketWithListener,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    const updatedSession = {
      participants: [
        { id: 'user-1', name: 'Alice', hasVoted: true, vote: '5' },
        { id: 'user-2', name: 'Bob', hasVoted: false },
      ],
      currentStory: 'Updated story',
      currentIssue: null,
      isVotingOpen: true,
      revealedVotes: false,
    };

    act(() => {
      sessionUpdatedHandler(updatedSession);
    });

    await waitFor(() => {
      expect(result.current.participants).toHaveLength(2);
      expect(result.current.currentStory).toBe('Updated story');
    });
  });

  it('should update user vote when session updates', async () => {
    let sessionUpdatedHandler: any = null;

    const mockSocketWithListener = {
      emit: jest.fn((event: string, ...args: any[]) => {
        if (event === 'get-session') {
          const callback = args[args.length - 1];
          callback({ success: true, session: mockInitialSession });
        }
      }),
      on: jest.fn((event: string, handler: any) => {
        if (event === 'session-updated') {
          sessionUpdatedHandler = handler;
        }
      }),
      off: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocketWithListener,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    const updatedSession = {
      participants: [
        { id: 'user-1', name: 'Alice', hasVoted: true, vote: '8' },
      ],
      currentStory: 'Test story',
      currentIssue: null,
      isVotingOpen: true,
      revealedVotes: false,
    };

    act(() => {
      sessionUpdatedHandler(updatedSession);
    });

    await waitFor(() => {
      expect(result.current.userVote).toBe('8');
    });
  });

  it('should handle error state', () => {
    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocket,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    act(() => {
      result.current.setError('Connection failed');
    });

    expect(result.current.error).toBe('Connection failed');
  });

  it('should handle success message state', () => {
    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocket,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    act(() => {
      result.current.setSuccessMessage('Vote submitted successfully');
    });

    expect(result.current.successMessage).toBe('Vote submitted successfully');
  });

  it('should set userVote', () => {
    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocket,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    act(() => {
      result.current.setUserVote('5');
    });

    expect(result.current.userVote).toBe('5');
  });

  it('should handle issue estimation updated event', async () => {
    let issueEstimationHandler: any = null;

    const mockSocketWithListener = {
      emit: jest.fn((event: string, ...args: any[]) => {
        if (event === 'get-session') {
          const callback = args[args.length - 1];
          callback({ success: true, session: mockInitialSession });
        }
      }),
      on: jest.fn((event: string, handler: any) => {
        if (event === 'issue-estimation-updated') {
          issueEstimationHandler = handler;
        }
      }),
      off: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionState({
        socket: mockSocketWithListener,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    act(() => {
      issueEstimationHandler();
    });

    await waitFor(() => {
      expect(result.current.successMessage).toBe('Story points updated successfully! Resetting votes...');
      expect(result.current.userVote).toBeNull();
    });
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useSessionState({
        socket: mockSocket,
        sessionId: 'session-1',
        userName: 'Alice',
        initialSession: mockInitialSession,
      })
    );

    unmount();

    expect(mockSocket.off).toHaveBeenCalled();
  });
});
