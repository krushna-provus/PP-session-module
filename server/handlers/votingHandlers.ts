import { Server, Socket } from "socket.io";
import { Session, Participant } from "../types.js";
import { SessionManager } from "../sessionManager.js";

export const createVotingHandlers = (io: Server, sessionManager: SessionManager) => {
  return {
    startVoting: (socket: Socket, sessionId: string, story: string) => {
      const session = sessionManager.getSession(sessionId);

      if (!session || session.hostId !== socket.id) return;

      session.currentStory = story;
      session.isVotingOpen = true;
      session.votes.clear();
      session.revealedVotes = false;

      session.participants.forEach((p: Participant) => {
        p.vote = undefined;
      });

      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },

    vote: (socket: Socket, sessionId: string, estimation: string) => {
      const session = sessionManager.getSession(sessionId);
      if (!session || !session.isVotingOpen) return;

      const participant = session.participants.get(socket.id);
      if (participant) {
        participant.vote = estimation;
        session.votes.set(socket.id, estimation);
      }

      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },

    revealVotes: (socket: Socket, sessionId: string) => {
      const session = sessionManager.getSession(sessionId);
      if (!session || session.hostId !== socket.id) return;

      session.revealedVotes = true;
      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },

    resetVotes: (socket: Socket, sessionId: string) => {
      const session = sessionManager.getSession(sessionId);
      if (!session || session.hostId !== socket.id) return;

      session.votes.clear();
      session.revealedVotes = false;
      session.currentStory = undefined;
      session.isVotingOpen = false;

      session.participants.forEach((p: Participant) => {
        p.vote = undefined;
      });

      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },
  };
};
