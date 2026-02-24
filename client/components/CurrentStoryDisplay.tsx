import React from "react";

interface FieldData {
  status: { name: string };
  assignee?: { displayName: string };
  [key: string]: unknown;
}

interface IssueData {
  key: string;
  fields: FieldData;
}

interface CurrentStoryDisplayProps {
  currentStory: string;
  currentIssue: IssueData | null;
  isVotingOpen: boolean;
  allVoted: boolean;
}

export default function CurrentStoryDisplay({
  currentStory,
  currentIssue,
  isVotingOpen,
  allVoted,
}: CurrentStoryDisplayProps) {
  if (!currentStory) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
      <p className="text-gray-400 text-sm mb-2">
        {currentIssue ? "Current Issue" : "Current Story"}
      </p>
      <p className="text-white text-2xl font-bold">{currentStory}</p>
      {currentIssue && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-white">{currentIssue.key}</span>
          </p>
          <p className="text-gray-400 text-sm">
            Status:{" "}
            <span className="text-white font-medium">
              {currentIssue.fields.status.name}
            </span>
          </p>
          {currentIssue.fields.assignee && (
            <p className="text-gray-400 text-sm">
              Assignee:{" "}
              <span className="text-white font-medium">
                {currentIssue.fields.assignee.displayName}
              </span>
            </p>
          )}
        </div>
      )}
      {isVotingOpen && (
        <p className="text-green-400 text-sm mt-4 font-semibold">
          Voting in progress... {allVoted ? "All voted!" : "Waiting for votes"}
        </p>
      )}
    </div>
  );
}
