import { Server, Socket } from "socket.io";
import { SessionManager } from "../sessionManager.js";
import { getBoards, getSprints, getIssues, updateIssueStoryPoints } from "../jira.js";

export const createJiraHandlers = (io: Server, sessionManager: SessionManager) => {
  return {
    getBoards: async (socket: Socket, callback: Function) => {
      try {
        const boards = await getBoards();
        callback({ success: true, boards });
      } catch (error) {
        callback({ success: false, error: String(error) });
      }
    },

    getSprints: async (socket: Socket, boardId: number, callback: Function) => {
      try {
        const sprints = await getSprints(boardId);
        callback({ success: true, sprints });
      } catch (error) {
        callback({ success: false, error: String(error) });
      }
    },

    getIssues: async (socket: Socket, boardId: number, sprintId: number, callback: Function) => {
      try {
        const issues = await getIssues(boardId, sprintId);
        callback({ success: true, issues });
      } catch (error) {
        callback({ success: false, error: String(error) });
      }
    },

    startVotingIssue: (socket: Socket, sessionId: string, boardId: number, sprintId: number, issue: any) => {
      const session = sessionManager.getSession(sessionId);
      if (!session || session.hostId !== socket.id) return;

      session.boardId = boardId;
      session.sprintId = sprintId;
      session.currentIssue = issue;
      session.currentStory = issue.fields.summary;
      session.isVotingOpen = true;
      session.votes.clear();
      session.revealedVotes = false;

      session.participants.forEach((p) => {
        p.vote = undefined;
      });

      io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
    },

    updateIssueEstimation: async (
      socket: Socket,
      sessionId: string,
      issueId: string,
      estimation: string,
      callback: Function,
    ) => {
      const session = sessionManager.getSession(sessionId);
      if (!session || session.hostId !== socket.id) {
        callback?.({ success: false, error: "Not authorized" });
        return;
      }

      try {
        const storyPoints = parseInt(estimation);
        await updateIssueStoryPoints(issueId, storyPoints);

        session.isVotingOpen = false;
        session.votes.clear();
        session.revealedVotes = false;
        session.currentStory = undefined;
        session.currentIssue = undefined;
        session.participants.forEach((p) => {
          p.vote = undefined;
        });

        callback?.({ success: true });

        io.to(sessionId).emit("issue-estimation-updated", issueId, estimation);
        io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
      } catch (error) {
        callback?.({ success: false, error: String(error) });
      }
    },
  };
};
