"use client";

import { useState } from "react";
import SessionView from "@/components/SessionView";
import StartView from "@/components/StartView";
import { useSocket } from "@/hooks/useSocket";

interface SessionData {
  success: boolean;
  error?: string;
  session?: Record<string, unknown>;
}

interface SessionCreateResponse {
  sessionId: string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [initialSession, setInitialSession] = useState<Record<string, unknown> | null>(null);

  const socket = useSocket();

  const handleCreateSession = (name: string, boardId: number, sprintId: number) => {
    setUserName(name);
    setIsHost(true);
    setSelectedBoardId(boardId);
    setSelectedSprintId(sprintId);
    if (socket) {
      socket.emit("create-session", name, (data: unknown) => {
        const response = data as SessionCreateResponse;
        setSessionId(response.sessionId);
      });
    }
  };

  const handleJoinSession = (id: string, name: string) => {
    setUserName(name);
    setIsHost(false);
    if (socket) {
      socket.emit(
        "join-session",
        id,
        name,
        (data: unknown) => {
          const response = data as SessionData;
          if (response.success) {
            if (response.session) setInitialSession(response.session);
            setSessionId(id);
          } else {
            alert(response.error || "Failed to join session");
          }
        }
      );
    }
  };

  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Connecting...</div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <StartView 
        socket={socket}
        onCreateSession={handleCreateSession} 
        onJoinSession={handleJoinSession} 
      />
    );
  }

  return (
    <SessionView 
      socket={socket} 
      sessionId={sessionId} 
      userName={userName} 
      isHost={isHost}
      selectedBoardId={selectedBoardId}
      selectedSprintId={selectedSprintId}
      initialSession={initialSession}
    />
  );
}
