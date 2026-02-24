import { v4 as uuidv4 } from "uuid";
import { Session, Participant, ParticipantState, SessionState } from "./types.js";

export class SessionManager {
  private sessions: Map<string, Session>;
  private userSessions: Map<string, string>; // socketId -> sessionId

  constructor() {
    this.sessions = new Map();
    this.userSessions = new Map();
  }

  createSession(hostId: string, hostName: string): { sessionId: string; session: Session } {
    const sessionId = uuidv4();

    const session: Session = {
      id: sessionId,
      hostId,
      participants: new Map(),
      isVotingOpen: false,
      votes: new Map(),
      revealedVotes: false,
    };

    const participant: Participant = {
      id: hostId,
      name: hostName,
      socketId: hostId,
    };

    session.participants.set(hostId, participant);
    this.sessions.set(sessionId, session);
    this.userSessions.set(hostId, sessionId);

    return { sessionId, session };
  }

  joinSession(socketId: string, sessionId: string, userName: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant: Participant = {
      id: socketId,
      name: userName,
      socketId,
    };

    session.participants.set(socketId, participant);
    this.userSessions.set(socketId, sessionId);

    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getUserSession(socketId: string): string | undefined {
    return this.userSessions.get(socketId);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  disconnectUser(socketId: string): { sessionId: string; session: Session | undefined } | null {
    const sessionId = this.userSessions.get(socketId);
    if (!sessionId) return null;

    const session = this.sessions.get(sessionId);
    if (session) {
      session.participants.delete(socketId);
      if (session.hostId === socketId) {
        this.sessions.delete(sessionId);
      }
    }

    this.userSessions.delete(socketId);
    return { sessionId, session };
  }

  getSessionState(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participants: ParticipantState[] = Array.from(session.participants.values()).map((p) => ({
      id: p.id,
      name: p.name,
      hasVoted: p.vote !== undefined,
      vote: session.revealedVotes ? p.vote : undefined,
    }));

    return {
      sessionId: session.id,
      isHost: false,
      currentStory: session.currentStory,
      currentIssue: session.currentIssue,
      isVotingOpen: session.isVotingOpen,
      participants,
      revealedVotes: session.revealedVotes,
    };
  }
}

export const createSessionManager = (): SessionManager => {
  return new SessionManager();
};
