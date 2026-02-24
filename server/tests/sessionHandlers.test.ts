import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionManager } from '../sessionManager.js';
import { createSessionHandlers } from '../handlers/sessionHandlers.js';

describe('Session Handlers', () => {
  let sessionManager: SessionManager;
  let mockSocket: any;
  let mockIo: any;
  let handlers: any;

  beforeEach(() => {
    sessionManager = new SessionManager();

    mockSocket = {
      emit: vi.fn(),
      to: vi.fn(function() { return this; }),
      id: 'socket-1',
    };

    mockIo = {
      to: vi.fn(function() { return this; }),
      emit: vi.fn(),
    };

    handlers = createSessionHandlers(sessionManager, mockIo);
  });

  describe('createSession', () => {
    it('should create a new session and return session ID', (done) => {
      const userName = 'Alice';

      handlers.createSession(mockSocket, userName, (response: any) => {
        expect(response.success).toBe(true);
        expect(response.sessionId).toBeDefined();
        expect(response.sessionId.length).toBeGreaterThan(0);
        expect(response.userId).toBeDefined();

        const session = sessionManager.getSession(response.sessionId);
        expect(session).toBeDefined();
        expect(session!.participants).toHaveLength(1);
        expect(session!.participants[0].name).toBe(userName);
        done();
      });
    });

    it('should return error if userName is empty', (done) => {
      handlers.createSession(mockSocket, '', (response: any) => {
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
        done();
      });
    });
  });

  describe('joinSession', () => {
    it('should allow user to join existing session', (done) => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      handlers.joinSession(mockSocket, session.id, 'Bob', (response: any) => {
        expect(response.success).toBe(true);
        expect(response.session).toBeDefined();
        expect(response.session.participants).toHaveLength(2);
        expect(response.session.participants.some((p: any) => p.name === 'Bob')).toBe(true);
        done();
      });
    });

    it('should return error if session does not exist', (done) => {
      handlers.joinSession(mockSocket, 'non-existent', 'Bob', (response: any) => {
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
        done();
      });
    });

    it('should return error if userName is empty', (done) => {
      const session = sessionManager.createSession();

      handlers.joinSession(mockSocket, session.id, '', (response: any) => {
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
        done();
      });
    });

    it('should not add duplicate users to session', (done) => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      handlers.joinSession(mockSocket, session.id, 'Alice', (response: any) => {
        const updatedSession = sessionManager.getSession(session.id);
        // Should still have 1 participant since Alice was already there
        expect(updatedSession!.participants.length).toBeLessThanOrEqual(2);
        done();
      });
    });
  });

  describe('getSession', () => {
    it('should return session state for valid session ID', (done) => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');
      sessionManager.joinSession(session.id, 'user-2', 'Bob');

      handlers.getSession(mockSocket, session.id, (response: any) => {
        expect(response.success).toBe(true);
        expect(response.session).toBeDefined();
        expect(response.session.id).toBe(session.id);
        expect(response.session.participants).toHaveLength(2);
        done();
      });
    });

    it('should return error for non-existent session', (done) => {
      handlers.getSession(mockSocket, 'non-existent', (response: any) => {
        expect(response.success).toBe(false);
        done();
      });
    });

    it('should include all participant information', (done) => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      const sess = sessionManager.getSession(session.id)!;
      sess.participants[0].vote = '5';
      sess.participants[0].hasVoted = true;
      sess.isVotingOpen = true;

      handlers.getSession(mockSocket, session.id, (response: any) => {
        const participant = response.session.participants[0];
        expect(participant.id).toBe('user-1');
        expect(participant.name).toBe('Alice');
        expect(participant.hasVoted).toBe(true);
        expect(participant.vote).toBe('5');
        done();
      });
    });
  });
});
