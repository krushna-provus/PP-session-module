"use client";

import { CheckCircle, Circle } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
}

interface ParticipantListProps {
  participants: Participant[];
  revealedVotes: boolean;
  meetLink?: string | null;
  isHost?: boolean;
}

export default function ParticipantList({ participants, revealedVotes, meetLink, isHost }: ParticipantListProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 h-fit sticky top-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Participants ({participants.length})
      </h2>
      {/* {meetLink && !isHost && (
        <div className="bg-blue-800 border border-blue-600 text-blue-100 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">Meeting available</div>
            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-semibold text-sm">
              Join
            </a>
          </div>
          <div className="text-xs text-blue-200 break-all mt-2">{meetLink}</div>
        </div>
      )} */}
      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                {participant.hasVoted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <span className="text-white font-medium truncate">{participant.name}</span>
            </div>
            {revealedVotes && participant.vote && (
              <div className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-md font-bold text-sm">
                {participant.vote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
