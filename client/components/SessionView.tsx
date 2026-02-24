"use client";

import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import VotingCards from "@/components/VotingCards";
import ParticipantList from "@/components/ParticipantList";
import JiraIntegration from "@/components/JiraIntegration";
import AlertBanners from "@/components/AlertBanners";
import SessionHeader from "@/components/SessionHeader";
import EstimationModeSelector from "@/components/EstimationModeSelector";
import ManualStoryInput from "@/components/ManualStoryInput";
import CurrentStoryDisplay from "@/components/CurrentStoryDisplay";
import VoteSummaryDisplay from "@/components/VoteSummaryDisplay";
import JiraEstimationConfirmation from "@/components/JiraEstimationConfirmation";
import HostControls from "@/components/HostControls";
import { useSessionState } from "@/hooks/useSessionState";
import { useVoteHandlers } from "@/hooks/useVoteHandlers";
import { sortVotes } from "@/utils/voteCalculations";

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

interface SessionViewProps {
  socket: Socket;
  sessionId: string;
  userName: string;
  isHost: boolean;
  selectedBoardId?: number | null;
  selectedSprintId?: number | null;
  initialSession?: Record<string, unknown> | null;
}

export default function SessionView({
  socket,
  sessionId,
  userName,
  isHost,
  selectedBoardId: initialBoardId,
  selectedSprintId: initialSprintId,
  initialSession,
}: SessionViewProps) {
  const [storyInput, setStoryInput] = useState<string>("");
  const [useJira, setUseJira] = useState(initialBoardId && initialSprintId ? true : false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(initialBoardId || null);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(initialSprintId || null);

  const {
    participants,
    currentStory,
    currentIssue,
    isVotingOpen,
    revealedVotes,
    userVote,
    error,
    successMessage,
    setError,
    setUserVote,
    setSuccessMessage,
  } = useSessionState({
    socket,
    sessionId,
    userName,
    initialSession,
  });

  const {
    selectedVoteOption,
    setSelectedVoteOption,
    handleVote,
    handleRevealVotes,
    handleResetVotes,
    handleConfirmEstimation,
    minVote,
    maxVote,
    avgVote,
  } = useVoteHandlers({
    socket,
    sessionId,
    currentIssue: (currentIssue as IssueData | null),
    revealedVotes,
    participants,
    setError,
    setSuccess: setSuccessMessage,
    setUserVote,
  });

  // Reset selectedVoteOption when issue changes
  useEffect(() => {
    setSelectedVoteOption(null);
  }, [currentIssue?.id, setSelectedVoteOption]);

  const handleStartVoting = () => {
    if (storyInput.trim()) {
      socket.emit("start-voting", sessionId, storyInput);
      setStoryInput("");
      setUserVote(null);
    }
  };

  const handleJiraIssueSelected = (boardId: number, sprintId: number, issue: IssueData) => {
    setSelectedBoardId(boardId);
    setSelectedSprintId(sprintId);
    socket.emit("start-voting-issue", sessionId, boardId, sprintId, issue);
    setUserVote(null);
  };

  const handleLeaveSession = () => {
    window.location.reload();
  };

  const allVoted = participants.every((p) => p.hasVoted);
  const voteSummary = sortVotes(
    revealedVotes
      ? participants.map((p) => p.vote).filter(Boolean)
      : []
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <AlertBanners error={error} successMessage={successMessage} />

        <SessionHeader
          sessionId={sessionId}
          userName={userName}
          isHost={isHost}
          onLeave={handleLeaveSession}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            {isHost && !isVotingOpen && (
              <EstimationModeSelector
                useJira={useJira}
                isVotingOpen={isVotingOpen}
                onToggleMode={setUseJira}
              />
            )}

            {isHost && !useJira && (
              <ManualStoryInput
                storyInput={storyInput}
                isVotingOpen={isVotingOpen}
                onInputChange={setStoryInput}
                onStartVoting={handleStartVoting}
              />
            )}

            {isHost && useJira && (
              <JiraIntegration
                socket={socket}
                sessionId={sessionId}
                isHost={isHost}
                onIssueSelected={handleJiraIssueSelected}
                selectedBoardId={selectedBoardId}
                selectedSprintId={selectedSprintId}
              />
            )}

            <CurrentStoryDisplay
              currentStory={currentStory}
              currentIssue={(currentIssue as IssueData | null)}
              isVotingOpen={isVotingOpen}
              allVoted={allVoted}
            />

            {isVotingOpen && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Your Vote</h3>
                <VotingCards selectedVote={userVote} onVote={handleVote} />
              </div>
            )}

            <VoteSummaryDisplay revealedVotes={revealedVotes} voteSummary={voteSummary} />

            <JiraEstimationConfirmation
              currentIssue={(currentIssue as IssueData | null)}
              isHost={isHost}
              revealedVotes={revealedVotes}
              minVote={minVote}
              avgVote={avgVote}
              maxVote={maxVote}
              selectedVoteOption={selectedVoteOption}
              onConfirmEstimation={handleConfirmEstimation}
            />

            <HostControls
              isHost={isHost}
              isVotingOpen={isVotingOpen}
              revealedVotes={revealedVotes}
              onRevealVotes={handleRevealVotes}
              onResetVotes={handleResetVotes}
            />
          </div>

          {/* Participants Sidebar */}
          <div>
            <ParticipantList participants={participants} revealedVotes={revealedVotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
