import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../sessionManager.js';
import type { ParticipantData } from '../types.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('createSession', () => {
    it('should create a new session with a valid session ID', () => {
      const session = sessionManager.createSession();
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.id.length).toBeGreaterThan(0);
      expect(session.participants).toEqual([]);
      expect(session.currentStory).toBe('');
      expect(session.isVotingOpen).toBe(false);
      expect(session.revealedVotes).toBe(false);
    });

    it('should create multiple sessions with unique IDs', () => {
      const session1 = sessionManager.createSession();
      const session2 = sessionManager.createSession();
      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('joinSession', () => {
    it('should add a participant to an existing session', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      const retrievedSession = sessionManager.getSession(session.id);
      expect(retrievedSession).toBeDefined();
      expect(retrievedSession!.participants).toHaveLength(1);
      expect(retrievedSession!.participants[0].name).toBe('Alice');
      expect(retrievedSession!.participants[0].id).toBe('user-1');
    });

    it('should add multiple participants to the same session', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');
      sessionManager.joinSession(session.id, 'user-2', 'Bob');

      const retrievedSession = sessionManager.getSession(session.id);
      expect(retrievedSession!.participants).toHaveLength(2);
      expect(retrievedSession!.participants.map(p => p.name)).toEqual(['Alice', 'Bob']);
    });

    it('should not add duplicate users to the session', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      const retrievedSession = sessionManager.getSession(session.id);
      expect(retrievedSession!.participants).toHaveLength(1);
    });
  });

  describe('getSession', () => {
    it('should return a session that exists', () => {
      const session = sessionManager.createSession();
      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(session.id);
    });

    it('should return undefined for a session that does not exist', () => {
      const retrieved = sessionManager.getSession('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getUserSession', () => {
    it('should return the session a user is in', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      const userSession = sessionManager.getUserSession('user-1');
      expect(userSession).toBeDefined();
      expect(userSession!.id).toBe(session.id);
    });

    it('should return undefined for a user not in any session', () => {
      const userSession = sessionManager.getUserSession('non-existent-user');
      expect(userSession).toBeUndefined();
    });
  });

  describe('deleteSession', () => {
    it('should delete a session and its participants', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      sessionManager.deleteSession(session.id);

      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeUndefined();

      const userSession = sessionManager.getUserSession('user-1');
      expect(userSession).toBeUndefined();
    });
  });

  describe('disconnectUser', () => {
    it('should remove a user from their session', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');
      sessionManager.joinSession(session.id, 'user-2', 'Bob');

      sessionManager.disconnectUser('user-1');

      const retrievedSession = sessionManager.getSession(session.id);
      expect(retrievedSession!.participants).toHaveLength(1);
      expect(retrievedSession!.participants[0].name).toBe('Bob');

      const userSession = sessionManager.getUserSession('user-1');
      expect(userSession).toBeUndefined();
    });

    it('should delete session when last user disconnects', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');

      sessionManager.disconnectUser('user-1');

      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getSessionState', () => {
    it('should return complete session state with participants and votes', () => {
      const session = sessionManager.createSession();
      sessionManager.joinSession(session.id, 'user-1', 'Alice');
      sessionManager.joinSession(session.id, 'user-2', 'Bob');

      // Add votes manually to session
      const sess = sessionManager.getSession(session.id)!;
      sess.participants[0].hasVoted = true;
      sess.participants[0].vote = '5';
      sess.isVotingOpen = true;

      const state = sessionManager.getSessionState(session.id);
      expect(state).toBeDefined();
      expect(state!.participants).toHaveLength(2);
      expect(state!.participants[0].hasVoted).toBe(true);
      expect(state!.isVotingOpen).toBe(true);
    });

    it('should return null for non-existent session', () => {
      const state = sessionManager.getSessionState('non-existent');
      expect(state).toBeNull();
    });
  });
});
