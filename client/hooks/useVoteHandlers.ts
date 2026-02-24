"use client";

import { useState } from "react";
import { Socket } from "socket.io-client";
import { getMinVote, getMaxVote, getAvgVote } from "@/utils/voteCalculations";

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

interface UseVoteHandlersProps {
  socket: Socket | null;
  sessionId: string;
  currentIssue: IssueData | null;
  revealedVotes: boolean;
  participants: ParticipantData[];
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
  setUserVote: (vote: string | null) => void;
}

export const useVoteHandlers = ({
  socket,
  sessionId,
  currentIssue,
  revealedVotes,
  participants,
  setError,
  setSuccess,
  setUserVote,
}: UseVoteHandlersProps) => {
  const [selectedVoteOption, setSelectedVoteOption] = useState<"min" | "avg" | "max" | null>(null);

  const votes = participants.map((p) => p.vote).filter(Boolean);

  const handleVote = (estimation: string) => {
    socket?.emit("vote", sessionId, estimation);
    setUserVote(estimation);
  };

  const handleRevealVotes = () => {
    socket?.emit("reveal-votes", sessionId);
  };

  const handleResetVotes = () => {
    socket?.emit("reset-votes", sessionId);
    setUserVote(null);
  };

  const handleConfirmEstimation = (voteOption: "min" | "avg" | "max" | "manual", manualVote?: string) => {
    let selectedVote: string | null = null;
    if (voteOption === "min") selectedVote = getMinVote(votes);
    else if (voteOption === "avg") selectedVote = getAvgVote(votes);
    else if (voteOption === "max") selectedVote = getMaxVote(votes);
    else if (voteOption === "manual" && manualVote) selectedVote = manualVote;

    if (currentIssue && revealedVotes && selectedVote) {
      setSelectedVoteOption(voteOption as "min" | "avg" | "max" | null);
      socket?.emit("update-issue-estimation", sessionId, currentIssue.id, selectedVote, (data: Record<string, unknown>) => {
        if ((data as Record<string, unknown>).success) {
          setSuccess(`Successfully updated ${currentIssue.key} with ${selectedVote} story points!`);
          setError("");
          // Reset selectedVoteOption after 2 seconds to allow new voting
          setTimeout(() => {
            setSelectedVoteOption(null);
          }, 2000);
        } else {
          setError(((data as Record<string, unknown>).error as string) || "Failed to update estimation");
          setSelectedVoteOption(null);
        }
      });
    }
  };

  return {
    selectedVoteOption,
    setSelectedVoteOption,
    handleVote,
    handleRevealVotes,
    handleResetVotes,
    handleConfirmEstimation,
    minVote: getMinVote(votes),
    maxVote: getMaxVote(votes),
    avgVote: getAvgVote(votes),
    votes,
  };
};
