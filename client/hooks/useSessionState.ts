"use client";

import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface FieldData {
  status: { name: string };
  assignee?: { displayName: string };
  [key: string]: unknown;
}

interface IssueData {
  id: string;
  key: string;
  fields: FieldData;
}

interface ParticipantData {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
}

interface SessionStateData {
  participants: ParticipantData[];
  currentStory: string;
  currentIssue: IssueData | null;
  isVotingOpen: boolean;
  revealedVotes: boolean;
}

interface UseSessionStateProps {
  socket: Socket | null;
  sessionId: string;
  userName: string;
  initialSession?: Record<string, unknown> | null;
}

export const useSessionState = ({ socket, sessionId, userName, initialSession }: UseSessionStateProps) => {
  const [participants, setParticipants] = useState<ParticipantData[]>(() =>
    (initialSession?.participants as ParticipantData[]) || []
  );
  const [currentStory, setCurrentStory] = useState<string>(() =>
    (initialSession?.currentStory as string) || ""
  );
  const [currentIssue, setCurrentIssue] = useState<IssueData | null>(() =>
    (initialSession?.currentIssue as IssueData) || null
  );
  const [isVotingOpen, setIsVotingOpen] = useState(() =>
    (initialSession?.isVotingOpen as boolean) || false
  );
  const [revealedVotes, setRevealedVotes] = useState(() =>
    (initialSession?.revealedVotes as boolean) || false
  );
  const [userVote, setUserVote] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSessionUpdated = useCallback((data: SessionStateData) => {
    if (data) {
      setParticipants(data.participants || []);
      setCurrentStory(data.currentStory || "");
      setCurrentIssue(data.currentIssue || null);
      setIsVotingOpen(data.isVotingOpen || false);
      setRevealedVotes(data.revealedVotes || false);

      const userParticipant = (data.participants || []).find((p) => p.name === userName);
      if (userParticipant) {
        setUserVote(userParticipant.vote || null);
      }
    }
  }, [userName]);

  useEffect(() => {
    if (!socket) return;

    const handleHostDisconnected = () => {
      setError("Host disconnected. Session ended.");
      setTimeout(() => window.location.reload(), 2000);
    };

    const handleIssueEstimationUpdated = () => {
      setSuccessMessage("Story points updated successfully! Resetting votes...");
      setUserVote(null);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    };

    socket.on("session-updated", handleSessionUpdated);
    socket.on("host-disconnected", handleHostDisconnected);
    socket.on("issue-estimation-updated", handleIssueEstimationUpdated);

    try {
      socket.emit("get-session", sessionId, (data: Record<string, unknown>) => {
        if (data?.success && data.session) {
          handleSessionUpdated(data.session as SessionStateData);
        }
      });
    } catch {
      // ignore emit errors
    }

    return () => {
      socket.off("session-updated", handleSessionUpdated);
      socket.off("host-disconnected", handleHostDisconnected);
      socket.off("issue-estimation-updated", handleIssueEstimationUpdated);
    };
  }, [socket, sessionId, handleSessionUpdated]);

  return {
    participants,
    currentStory,
    currentIssue,
    isVotingOpen,
    revealedVotes,
    userVote,
    error,
    successMessage,
    setParticipants,
    setCurrentStory,
    setCurrentIssue,
    setIsVotingOpen,
    setRevealedVotes,
    setUserVote,
    setError,
    setSuccessMessage,
    handleSessionUpdated,
  };
};
