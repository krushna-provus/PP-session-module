import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionManager } from '../sessionManager.js';
import { createVotingHandlers } from '../handlers/votingHandlers.js';
import type { Session } from '../types.js';

describe('Voting Handlers', () => {
  let sessionManager: SessionManager;
  let session: Session;
  let mockSocket: any;
  let mockIo: any;
  let handlers: any;

  beforeEach(() => {
    sessionManager = new SessionManager();
    session = sessionManager.createSession();
    sessionManager.joinSession(session.id, 'user-1', 'Alice');
    sessionManager.joinSession(session.id, 'user-2', 'Bob');

    mockSocket = {
      emit: vi.fn(),
      to: vi.fn(function() { return this; }),
      broadcast: {
        emit: vi.fn(),
      },
    };

    mockIo = {
      to: vi.fn(function() { return this; }),
      emit: vi.fn(),
    };

    handlers = createVotingHandlers(sessionManager, mockIo);
  });

  describe('startVoting', () => {
    it('should start voting and broadcast to all users', (done) => {
      const story = 'Implement login feature';
      
      handlers.startVoting(mockSocket, session.id, story, () => {
        const updatedSession = sessionManager.getSession(session.id);
        expect(updatedSession!.isVotingOpen).toBe(true);
        expect(updatedSession!.currentStory).toBe(story);
        expect(updatedSession!.revealedVotes).toBe(false);
        expect(mockIo.to).toHaveBeenCalledWith(session.id);
        done();
      });
    });

    it('should reset votes when starting new voting', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.participants[0].hasVoted = true;
      sess.participants[0].vote = '5';

      handlers.startVoting(mockSocket, session.id, 'New story', () => {
        const updatedSession = sessionManager.getSession(session.id)!;
        expect(updatedSession.participants.every(p => !p.hasVoted)).toBe(true);
        expect(updatedSession.participants.every(p => !p.vote)).toBe(true);
        done();
      });
    });
  });

  describe('vote', () => {
    it('should record a vote from a user', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = true;

      handlers.vote(mockSocket, session.id, 'user-1', '5', () => {
        const updatedSession = sessionManager.getSession(session.id)!;
        const participant = updatedSession.participants.find(p => p.id === 'user-1')!;
        expect(participant.vote).toBe('5');
        expect(participant.hasVoted).toBe(true);
        done();
      });
    });

    it('should not record vote if voting is not open', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = false;

      handlers.vote(mockSocket, session.id, 'user-1', '5', () => {
        const updatedSession = sessionManager.getSession(session.id)!;
        const participant = updatedSession.participants.find(p => p.id === 'user-1')!;
        expect(participant.vote).toBeUndefined();
        expect(participant.hasVoted).toBe(false);
        done();
      });
    });

    it('should allow changing vote before reveal', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = true;
      sess.revealedVotes = false;

      handlers.vote(mockSocket, session.id, 'user-1', '5', () => {
        handlers.vote(mockSocket, session.id, 'user-1', '8', () => {
          const updatedSession = sessionManager.getSession(session.id)!;
          const participant = updatedSession.participants.find(p => p.id === 'user-1')!;
          expect(participant.vote).toBe('8');
          done();
        });
      });
    });
  });

  describe('revealVotes', () => {
    it('should reveal votes and set revealedVotes flag', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = true;
      sess.participants[0].vote = '5';
      sess.participants[0].hasVoted = true;
      sess.participants[1].vote = '8';
      sess.participants[1].hasVoted = true;

      handlers.revealVotes(mockSocket, session.id, () => {
        const updatedSession = sessionManager.getSession(session.id)!;
        expect(updatedSession.revealedVotes).toBe(true);
        done();
      });
    });

    it('should broadcast votes to all participants', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = true;
      sess.participants[0].vote = '5';
      sess.participants[0].hasVoted = true;

      handlers.revealVotes(mockSocket, session.id, () => {
        expect(mockIo.to).toHaveBeenCalledWith(session.id);
        done();
      });
    });
  });

  describe('resetVotes', () => {
    it('should reset all votes and voting state', (done) => {
      const sess = sessionManager.getSession(session.id)!;
      sess.isVotingOpen = true;
      sess.revealedVotes = true;
      sess.participants[0].vote = '5';
      sess.participants[0].hasVoted = true;
      sess.participants[1].vote = '8';
      sess.participants[1].hasVoted = true;

      handlers.resetVotes(mockSocket, session.id, () => {
        const updatedSession = sessionManager.getSession(session.id)!;
        expect(updatedSession.isVotingOpen).toBe(false);
        expect(updatedSession.revealedVotes).toBe(false);
        expect(updatedSession.participants.every(p => !p.hasVoted)).toBe(true);
        expect(updatedSession.participants.every(p => !p.vote)).toBe(true);
        done();
      });
    });

    it('should broadcast reset state to all participants', (done) => {
      handlers.resetVotes(mockSocket, session.id, () => {
        expect(mockIo.to).toHaveBeenCalledWith(session.id);
        done();
      });
    });
  });
});
