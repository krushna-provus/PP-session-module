import React, { useState } from "react";
import { Copy, Check, LogOut } from "lucide-react";

interface SessionHeaderProps {
  sessionId: string;
  userName: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function SessionHeader({ sessionId, userName, isHost, onLeave }: SessionHeaderProps) {
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Planning Poker</h1>
          <p className="text-gray-400 mt-1">
            Role: {isHost ? "Host" : "Participant"} | Member: {userName}
          </p>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Leave
        </button>
      </div>

      {/* Session ID Copy */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">Session ID</p>
          <p className="text-white font-mono text-xl">{sessionId}</p>
        </div>
        <button
          onClick={copySessionId}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          {copiedSessionId ? (
            <>
              <Check size={18} />
              Copied
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy
            </>
          )}
        </button>
      </div>
    </>
  );
}
