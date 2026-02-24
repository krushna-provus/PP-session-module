// Test fixtures and mock data for reuse across tests
import { vi } from 'vitest';

export const mockUsers = {
  host: {
    id: 'user-host',
    name: 'Host',
  },
  alice: {
    id: 'user-1',
    name: 'Alice',
  },
  bob: {
    id: 'user-2',
    name: 'Bob',
  },
  charlie: {
    id: 'user-3',
    name: 'Charlie',
  },
};

export const mockParticipants = [
  { id: 'user-1', name: 'Alice', hasVoted: false, vote: undefined },
  { id: 'user-2', name: 'Bob', hasVoted: false, vote: undefined },
  { id: 'user-3', name: 'Charlie', hasVoted: false, vote: undefined },
];

export const mockParticipantsWithVotes = [
  { id: 'user-1', name: 'Alice', hasVoted: true, vote: '5' },
  { id: 'user-2', name: 'Bob', hasVoted: true, vote: '8' },
  { id: 'user-3', name: 'Charlie', hasVoted: true, vote: '5' },
];

export const mockFieldData = {
  status: { name: 'To Do' },
  assignee: { displayName: 'John Doe' },
};

export const mockIssue = {
  id: 'issue-1',
  key: 'TEST-1',
  fields: mockFieldData,
};

export const mockIssue2 = {
  id: 'issue-2',
  key: 'TEST-2',
  fields: {
    status: { name: 'In Progress' },
    assignee: { displayName: 'Jane Smith' },
  },
};

export const mockStories = [
  'Implement user authentication',
  'Create dashboard page',
  'Add export functionality',
  'Refactor database queries',
  'Write API documentation',
];

export const mockVotes = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34'],
  lowVotes: ['1', '2', '3'],
  highVotes: ['13', '21', '34'],
  mixedVotes: ['3', '5', '8', '13', '21'],
};

export const mockSessionState = {
  id: 'session-1',
  participants: mockParticipants,
  currentStory: 'Implement user authentication',
  currentIssue: null,
  isVotingOpen: false,
  revealedVotes: false,
};

export const mockVotingSessionState = {
  ...mockSessionState,
  isVotingOpen: true,
};

export const mockRevealedSessionState = {
  ...mockSessionState,
  isVotingOpen: true,
  revealedVotes: true,
  participants: mockParticipantsWithVotes,
};

export const createMockSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

export const createMockIoServer = () => ({
  to: vi.fn(function() { return this; }),
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});

export const createMockCallback = () => vi.fn();

// Test data generators

export function generateParticipant(overrides = {}) {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: `User-${Math.random().toString(36).substr(2, 5)}`,
    hasVoted: false,
    vote: undefined,
    ...overrides,
  };
}

export function generateVote(): string {
  const votes = ['0', '1', '2', '3', '5', '8', '13', '21', '34'];
  return votes[Math.floor(Math.random() * votes.length)];
}

export function generateSessionId(): string {
  return `session-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateStory(): string {
  const stories = mockStories;
  return stories[Math.floor(Math.random() * stories.length)];
}

// Assertion helpers

export function expectParticipantHasVoted(participant: any) {
  expect(participant.hasVoted).toBe(true);
  expect(participant.vote).toBeDefined();
  expect(participant.vote).not.toBeNull();
}

export function expectParticipantHasNotVoted(participant: any) {
  expect(participant.hasVoted).toBe(false);
  expect(participant.vote).toBeUndefined();
}

export function expectVotingIsOpen(session: any) {
  expect(session.isVotingOpen).toBe(true);
  expect(session.revealedVotes).toBe(false);
}

export function expectVotingIsClosed(session: any) {
  expect(session.isVotingOpen).toBe(false);
}

export function expectVotesAreRevealed(session: any) {
  expect(session.revealedVotes).toBe(true);
}

export function expectVotesAreHidden(session: any) {
  expect(session.revealedVotes).toBe(false);
}

export function expectSessionHasParticipants(session: any, count: number) {
  expect(session.participants).toHaveLength(count);
}

export function expectAllParticipantsHaveVoted(participants: any[]) {
  expect(participants.every(p => p.hasVoted)).toBe(true);
}

export function expectNoParticipantsHaveVoted(participants: any[]) {
  expect(participants.every(p => !p.hasVoted)).toBe(true);
}
