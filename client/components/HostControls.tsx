import React from "react";

interface HostControlsProps {
  isHost: boolean;
  isVotingOpen: boolean;
  revealedVotes: boolean;
  onRevealVotes: () => void;
  onResetVotes: () => void;
}

export default function HostControls({
  isHost,
  isVotingOpen,
  revealedVotes,
  onRevealVotes,
  onResetVotes,
}: HostControlsProps) {
  if (!isHost || !isVotingOpen) return null;

  return (
    <div className="flex gap-4">
      <button
        onClick={onRevealVotes}
        disabled={revealedVotes}
        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Reveal Votes
      </button>
      <button
        onClick={onResetVotes}
        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Reset Round
      </button>
    </div>
  );
}
