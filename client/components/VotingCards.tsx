"use client";

interface VotingCardsProps {
  selectedVote: string | null;
  onVote: (estimation: string) => void;
}

const ESTIMATIONS = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"];

export default function VotingCards({ selectedVote, onVote }: VotingCardsProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {ESTIMATIONS.map((estimation) => (
        <button
          key={estimation}
          onClick={() => onVote(estimation)}
          className={`p-4 rounded-lg font-bold text-lg aspect-square flex items-center justify-center transition-all transform hover:scale-110 ${
            selectedVote === estimation
              ? "bg-green-600 text-white ring-4 ring-green-400 scale-110"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          {estimation}
        </button>
      ))}
    </div>
  );
}
