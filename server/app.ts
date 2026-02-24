import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { createSessionManager } from "./sessionManager.js";
import { createSessionHandlers } from "./handlers/sessionHandlers.js";
import { createVotingHandlers } from "./handlers/votingHandlers.js";
import { createJiraHandlers } from "./handlers/jiraHandlers.js";
import type { Session } from "./types.js";

dotenv.config();

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  const sessionManager = createSessionManager();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Initialize handlers
  const sessionHandlers = createSessionHandlers(io, sessionManager);
  const votingHandlers = createVotingHandlers(io, sessionManager);
  const jiraHandlers = createJiraHandlers(io, sessionManager);

  // Socket connection handler
  io.on("connection", (socket) => {
    // Session events
    socket.on("create-session", (name: string, callback) => {
      sessionHandlers.createSession(socket, name, callback);
    });

    socket.on("join-session", (sessionId: string, name: string, callback) => {
      sessionHandlers.joinSession(socket, sessionId, name, callback);
    });

    socket.on("get-session", (sessionId: string, callback) => {
      sessionHandlers.getSession(socket, sessionId, callback);
    });

    // Voting events
    socket.on("start-voting", (sessionId: string, story: string) => {
      votingHandlers.startVoting(socket, sessionId, story);
    });

    socket.on("vote", (sessionId: string, estimation: string) => {
      votingHandlers.vote(socket, sessionId, estimation);
    });

    socket.on("reveal-votes", (sessionId: string) => {
      votingHandlers.revealVotes(socket, sessionId);
    });

    socket.on("reset-votes", (sessionId: string) => {
      votingHandlers.resetVotes(socket, sessionId);
    });

    // Jira events
    socket.on("get-boards", async (callback) => {
      await jiraHandlers.getBoards(socket, callback);
    });

    socket.on("get-sprints", async (boardId: number, callback) => {
      await jiraHandlers.getSprints(socket, boardId, callback);
    });

    socket.on("get-issues", async (boardId: number, sprintId: number, callback) => {
      await jiraHandlers.getIssues(socket, boardId, sprintId, callback);
    });

    socket.on("start-voting-issue", (sessionId: string, boardId: number, sprintId: number, issue: any) => {
      jiraHandlers.startVotingIssue(socket, sessionId, boardId, sprintId, issue);
    });

    socket.on("update-issue-estimation", async (sessionId: string, issueId: string, estimation: string, callback) => {
      await jiraHandlers.updateIssueEstimation(socket, sessionId, issueId, estimation, callback);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      const result = sessionManager.disconnectUser(socket.id);
      if (result) {
        const { sessionId, session } = result;
        if (session) {
          if (session.hostId === socket.id) {
            io.to(sessionId).emit("host-disconnected");
          } else {
            io.to(sessionId).emit("session-updated", sessionManager.getSessionState(sessionId));
          }
        }
      }
    });
  });

  return { app, httpServer, io };
}

export default createApp;
