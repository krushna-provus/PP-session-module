import React from "react";

interface EstimationModeSelectorProps {
  useJira: boolean;
  isVotingOpen: boolean;
  onToggleMode: (useJira: boolean) => void;
}

export default function EstimationModeSelector({ useJira, isVotingOpen, onToggleMode }: EstimationModeSelectorProps) {
  if (isVotingOpen) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Estimation Mode</h2>
      <div className="flex gap-4">
        <button
          onClick={() => onToggleMode(false)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            !useJira
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Manual Story
        </button>
        <button
          onClick={() => onToggleMode(true)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            useJira
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Jira Issue
        </button>
      </div>
    </div>
  );
}
