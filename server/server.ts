import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { getBoards, getSprints, getIssues, updateIssueStoryPoints } from "./jira.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Types
interface Participant {
  id: string;
  name: string;
  socketId: string;
  vote?: string;
}

interface Session {
  id: string;
  hostId: string;
  participants: Map<string, Participant>;
  currentStory?: string;
  currentIssue?: any;
  isVotingOpen: boolean;
  votes: Map<string, string>;
  revealedVotes: boolean;
  boardId?: number;
  sprintId?: number;
  meetLink?: string | null;
}

// Storage
const sessions = new Map<string, Session>();
const userSessions = new Map<string, string>(); // socketId -> sessionId

// Endpoints
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Socket.io events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("create-session", (name: string, callback) => {
    const sessionId = uuidv4();
    const hostId = socket.id;

    const session: Session = {
      id: sessionId,
      hostId,
      participants: new Map(),
      isVotingOpen: false,
      votes: new Map(),
      revealedVotes: false,
    };

    sessions.set(sessionId, session);
    userSessions.set(socket.id, sessionId);

    // Add host as participant
    const participant: Participant = {
      id: socket.id,
      name,
      socketId: socket.id,
    };
    session.participants.set(socket.id, participant);

    socket.join(sessionId);
    callback({ sessionId });

    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  socket.on("join-session", (sessionId: string, name: string, callback) => {
    const session = sessions.get(sessionId);

    if (!session) {
      callback({ success: false, error: "Session not found" });
      return;
    }

    userSessions.set(socket.id, sessionId);

    const participant: Participant = {
      id: socket.id,
      name,
      socketId: socket.id,
    };

    session.participants.set(socket.id, participant);

    socket.join(sessionId);
    
    // Build session state and send it back in the callback so the joining client
    // can apply the current state immediately (avoids race where the client
    // hasn't yet registered listeners).
    const sessionState = getSessionState(sessionId);

    // Send callback with session state so joining client receives immediate state
    callback({ success: true, session: sessionState });

    // Notify all participants including the newly joined one
    io.to(sessionId).emit("session-updated", sessionState);
  });

  socket.on("start-voting", (sessionId: string, story: string) => {
    const session = sessions.get(sessionId);

    if (!session || session.hostId !== socket.id) {
      return;
    }

    session.currentStory = story;
    session.isVotingOpen = true;
    session.votes.clear();
    session.revealedVotes = false;

    // Clear previous votes from participants
    session.participants.forEach((p) => {
      p.vote = undefined;
    });

    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  socket.on("vote", (sessionId: string, estimation: string) => {
    const session = sessions.get(sessionId);

    if (!session || !session.isVotingOpen) {
      return;
    }

    const participant = session.participants.get(socket.id);
    if (participant) {
      participant.vote = estimation;
      session.votes.set(socket.id, estimation);
    }

    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  socket.on("reveal-votes", (sessionId: string) => {
    const session = sessions.get(sessionId);

    if (!session || session.hostId !== socket.id) {
      return;
    }

    session.revealedVotes = true;
    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  socket.on("reset-votes", (sessionId: string) => {
    const session = sessions.get(sessionId);

    if (!session || session.hostId !== socket.id) {
      return;
    }

    session.votes.clear();
    session.revealedVotes = false;
    session.currentStory = undefined;
    session.isVotingOpen = false;

    session.participants.forEach((p) => {
      p.vote = undefined;
    });

    // clear any meet link on reset and notify clients
    session.meetLink = undefined;
    io.to(sessionId).emit("meet-link", null);

    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  // Host can set a meet link for the session (stored and broadcast)
  socket.on("meet-link", (sessionId: string, url: string | null) => {
    const session = sessions.get(sessionId);
    if (!session || session.hostId !== socket.id) return;
    session.meetLink = url || null;
    io.to(sessionId).emit("meet-link", session.meetLink || null);
    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  // Host can explicitly broadcast meet link to participants
  socket.on("broadcast-meet-link", (sessionId: string, meetLink: string,callback) => {
    // const session = sessions.get(sessionId);
    // if (!session || session.hostId !== socket.id) return;
    // session.meetLink = url;
    // io.to(sessionId).emit("meet-link", url);
    // // also emit full session state so clients that rely on session-updated receive the meetLink
    // io.to(sessionId).emit("session-updated", getSessionState(sessionId));
    console.log("[HOST] Send Meet Link to Participants - Socket ID:", socket.id, "Session ID:", sessionId);
    const session = sessions.get(sessionId);

    if (!session) {
      console.error("[HOST] Session not found:", sessionId);
      callback?.({ success: false, error: "Session not found" });
      return;
    }

    if (session.hostId !== socket.id) {
      console.error("[HOST] Not authorized - Expected host:", session.hostId, "Got:", socket.id);
      callback?.({ success: false, error: "Not authorized" });
      return;
    }

    console.log("[HOST] Broadcasting meet link to session:", sessionId);
    console.log("[HOST] Meet link:", meetLink);
    console.log("[HOST] Number of participants:", Array.from(session.participants.values()).map(p => p.name));
    
    // Check room members
    const room = io.sockets.adapter.rooms.get(sessionId);
    console.log("[HOST] Sockets in room", sessionId, ":", room ? Array.from(room) : "ROOM NOT FOUND");
    
    // Send callback to host immediately
    callback?.({ success: true });
    
    // Broadcast to all participants (including host)
    console.log("[HOST] Emitting receive-meet-link event to room:", sessionId, "with data:", { meetLink });
    io.to(sessionId).emit("receive-meet-link", { meetLink });
    console.log("[HOST] Broadcast complete");
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const sessionId = userSessions.get(socket.id);

    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        session.participants.delete(socket.id);

        // If host disconnects, delete session
        if (session.hostId === socket.id) {
          sessions.delete(sessionId);
          io.to(sessionId).emit("host-disconnected");
        } else {
          io.to(sessionId).emit("session-updated", getSessionState(sessionId));
        }
      }

      userSessions.delete(socket.id);
    }
  });

  // Jira integration events
  socket.on("get-session", (sessionId: string, callback) => {
    try {
      const state = getSessionState(sessionId);
      if (state) callback({ success: true, session: state });
      else callback({ success: false, error: "Session not found" });
    } catch (err) {
      callback({ success: false, error: String(err) });
    }
  });

  socket.on("get-boards", async (callback) => {
    try {
      const boards = await getBoards();
      callback({ success: true, boards });
    } catch (error) {
      console.error("Error getting boards:", error);
      callback({ success: false, error: String(error) });
    }
  });

  socket.on("get-sprints", async (boardId: number, callback) => {
    try {
      const sprints = await getSprints(boardId);
      callback({ success: true, sprints });
    } catch (error) {
      console.error("Error getting sprints:", error);
      callback({ success: false, error: String(error) });
    }
  });

  socket.on("get-issues", async (boardId: number, sprintId: number, callback) => {
    try {
      const issues = await getIssues(boardId, sprintId);
      callback({ success: true, issues });
    } catch (error) {
      console.error("Error getting issues:", error);
      callback({ success: false, error: String(error) });
    }
  });

  socket.on("start-voting-issue", (sessionId: string, boardId: number, sprintId: number, issue: any) => {
    const session = sessions.get(sessionId);

    if (!session || session.hostId !== socket.id) {
      return;
    }

    session.boardId = boardId;
    session.sprintId = sprintId;
    session.currentIssue = issue;
    session.currentStory = issue.fields.summary;
    session.isVotingOpen = true;
    session.votes.clear();
    session.revealedVotes = false;

    // Clear previous votes from participants
    session.participants.forEach((p) => {
      p.vote = undefined;
    });

    io.to(sessionId).emit("session-updated", getSessionState(sessionId));
  });

  socket.on("update-issue-estimation", async (sessionId: string, issueId: string, estimation: string, callback) => {
    const session = sessions.get(sessionId);

    if (!session || session.hostId !== socket.id) {
      callback?.({ success: false, error: "Not authorized" });
      return;
    }

    try {
      const storyPoints = parseInt(estimation);
      await updateIssueStoryPoints(issueId, storyPoints);
      
      // Reset voting state for next story
      session.isVotingOpen = false;
      session.votes.clear();
      session.revealedVotes = false;
      session.currentStory = undefined;
      session.currentIssue = undefined;
      session.participants.forEach((p) => {
        p.vote = undefined;
      });
      
      callback?.({ success: true });
      
      // Emit both events: issue-estimation-updated for client success message, then session-updated to reset state
      io.to(sessionId).emit("issue-estimation-updated", issueId, estimation);
      io.to(sessionId).emit("session-updated", getSessionState(sessionId));
    } catch (error) {
      console.error("Error updating issue estimation:", error);
      callback?.({ success: false, error: String(error) });
    }
  });
});

function getSessionState(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const participants = Array.from(session.participants.values()).map((p) => ({
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
    meetLink: session.meetLink || null,
  };
}

const PORT = parseInt(process.env.PORT || "3001", 10);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
