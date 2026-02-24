import { Server, Socket } from "socket.io";
import { SessionManager } from "../sessionManager.js";

export const createSessionHandlers = (io: Server, sessionManager: SessionManager) => {
  return {
    createSession: (socket: Socket, name: string, callback: Function) => {
      const { sessionId, session } = sessionManager.createSession(socket.id, name);

      socket.join(sessionId);
      callback({ sessionId });

      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },

    joinSession: (socket: Socket, sessionId: string, name: string, callback: Function) => {
      const session = sessionManager.joinSession(socket.id, sessionId, name);

      if (!session) {
        callback({ success: false, error: "Session not found" });
        return;
      }

      socket.join(sessionId);

      const sessionState = sessionManager.getSessionState(sessionId);

      callback({ success: true, session: sessionState });

      io.to(sessionId).emit("session-updated", sessionState);
    },

    getSession: (socket: Socket, sessionId: string, callback: Function) => {
      const sessionState = sessionManager.getSessionState(sessionId);
      if (!sessionState) {
        callback({ success: false, error: "Session not found" });
        return;
      }
      callback({ success: true, session: sessionState });
    },
  };
};
