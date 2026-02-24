import React from "react";

interface ManualStoryInputProps {
  storyInput: string;
  isVotingOpen: boolean;
  onInputChange: (value: string) => void;
  onStartVoting: () => void;
}

export default function ManualStoryInput({
  storyInput,
  isVotingOpen,
  onInputChange,
  onStartVoting,
}: ManualStoryInputProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Story/Task</h2>
      <div className="flex gap-4">
        <input
          type="text"
          value={storyInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onStartVoting()}
          placeholder="Enter story or task description"
          disabled={isVotingOpen}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={onStartVoting}
          disabled={!storyInput.trim() || isVotingOpen}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Start Vote
        </button>
      </div>
    </div>
  );
}
