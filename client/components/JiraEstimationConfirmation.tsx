import React, { useState } from "react";

interface FieldData {
  status: { name: string };
  assignee?: { displayName: string };
  [key: string]: unknown;
}

interface IssueData {
  key: string;
  id: string;
  fields: FieldData;
}

interface JiraEstimationConfirmationProps {
  currentIssue: IssueData | null;
  isHost: boolean;
  revealedVotes: boolean;
  minVote: string | null;
  avgVote: string | null;
  maxVote: string | null;
  selectedVoteOption: "min" | "avg" | "max" | null;
  onConfirmEstimation: (voteOption: "min" | "avg" | "max" | "manual", manualVote?: string) => void;
}

export default function JiraEstimationConfirmation({
  currentIssue,
  isHost,
  revealedVotes,
  minVote,
  avgVote,
  maxVote,
  selectedVoteOption,
  onConfirmEstimation,
}: JiraEstimationConfirmationProps) {
  const [manualInput, setManualInput] = useState<string>("");
  const isLoading = selectedVoteOption !== null;

  if (!currentIssue || !isHost || !revealedVotes || !(minVote || avgVote || maxVote)) {
    return null;
  }

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onConfirmEstimation("manual", manualInput);
      setManualInput("");
    }
  };

  return (
    <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-6">
      <h3 className="text-lg font-bold text-green-100 mb-4">Update Jira Estimation</h3>
      <p className="text-green-200 mb-6">
        Choose story points for <span className="font-semibold">{currentIssue.key}</span>:
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onConfirmEstimation("min")}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition"
          >
            Min: {minVote}
          </button>
          <button
            onClick={() => onConfirmEstimation("avg")}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition"
          >
            Avg: {avgVote}
          </button>
          <button
            onClick={() => onConfirmEstimation("max")}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition"
          >
            Max: {maxVote}
          </button>
        </div>

        <div className="border-t border-green-600 pt-4">
          <p className="text-green-200 text-sm mb-3">Or enter custom story points:</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleManualSubmit()}
              disabled={isLoading}
              placeholder="Enter story points..."
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {isLoading ? "Updating..." : "Submit"}
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-green-300 text-sm text-center animate-pulse">
            Updating Jira...
          </p>
        )}
      </div>
    </div>
  );
}
