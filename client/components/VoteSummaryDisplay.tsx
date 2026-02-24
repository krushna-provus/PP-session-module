import React from "react";

interface VoteSummaryDisplayProps {
  revealedVotes: boolean;
  voteSummary: (string | undefined)[];
}

export default function VoteSummaryDisplay({ revealedVotes, voteSummary }: VoteSummaryDisplayProps) {
  if (!revealedVotes || voteSummary.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Vote Summary</h3>
      <div className="flex gap-2 flex-wrap">
        {voteSummary.map((vote, idx) => (
          <div
            key={idx}
            className="bg-linear-to-br from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg text-lg font-bold"
          >
            {vote}
          </div>
        ))}
      </div>
    </div>
  );
}
