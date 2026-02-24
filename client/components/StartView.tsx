"use client";

import { useState } from "react";
import { Loader, ChevronRight } from "lucide-react";
import { Socket } from "socket.io-client";

interface Board {
  id: number;
  key: string;
  name: string;
  type: string;
}

interface Sprint {
  id: number;
  name: string;
  state: string;
}

interface StartViewProps {
  socket: Socket;
  onCreateSession: (name: string, boardId: number, sprintId: number) => void;
  onJoinSession: (sessionId: string, name: string) => void;
}

interface BoardsResponse {
  success: boolean;
  boards: Board[];
  error?: string;
}

interface SprintsResponse {
  success: boolean;
  sprints: Sprint[];
  error?: string;
}

export default function StartView({ socket, onCreateSession, onJoinSession }: StartViewProps) {
  const [view, setView] = useState<"menu" | "create" | "join" | "board" | "sprint">("menu");
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const handleCreate = () => {
    if (name.trim()) {
      setView("board");
      fetchBoards();
    }
  };

  const fetchBoards = () => {
    setLoading(true);
    setError("");
    socket.emit("get-boards", (data: unknown) => {
      setLoading(false);
      const response = data as BoardsResponse;
      if (response.success) {
        setBoards(response.boards);
      } else {
        setError(response.error || "Failed to fetch boards");
      }
    });
  };

  const handleBoardSelect = (board: Board) => {
    setSelectedBoard(board);
    setLoading(true);
    setError("");
    socket.emit("get-sprints", board.id, (data: unknown) => {
      setLoading(false);
      const response = data as SprintsResponse;
      if (response.success) {
        const activeSprints = response.sprints.filter((s: Sprint) =>
          ["active", "future"].includes(s.state.toLowerCase())
        );
        setSprints(activeSprints);
        setView("sprint");
      } else {
        setError(response.error || "Failed to fetch sprints");
      }
    });
  };

  const handleSprintSelect = (sprint: Sprint) => {
    if (selectedBoard) {
      onCreateSession(name, selectedBoard.id, sprint.id);
    }
  };

  const handleJoin = () => {
    if (name.trim() && sessionId.trim()) {
      onJoinSession(sessionId, name);
    }
  };

  const resetCreate = () => {
    setView("menu");
    setName("");
    setSelectedBoard(null);
    setSprints([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {view === "menu" && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Planning Poker</h1>
              <p className="text-gray-400 text-lg">Collaborative estimation for teams</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 space-y-4">
              <button
                onClick={() => setView("create")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                Create Session
              </button>
              <button
                onClick={() => setView("join")}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                Join Session
              </button>
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Session</h2>
              <p className="text-gray-400">Start a new planning poker session</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Next - Select Board
              </button>
              <button
                onClick={resetCreate}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {view === "board" && (
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Select Jira Board</h2>
              <p className="text-gray-400">Choose a board for estimation</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                <Loader className="animate-spin" size={20} />
                <span>Loading boards...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleBoardSelect(board)}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                  >
                    <div>
                      <p className="text-white font-medium">{board.name}</p>
                      <p className="text-gray-400 text-xs">{board.key}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={resetCreate}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Back
            </button>
          </div>
        )}

        {view === "sprint" && selectedBoard && (
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Select Sprint</h2>
              <p className="text-gray-400">Choose a sprint in {selectedBoard.name}</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                <Loader className="animate-spin" size={20} />
                <span>Loading sprints...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sprints.map((sprint) => (
                  <button
                    key={sprint.id}
                    onClick={() => handleSprintSelect(sprint)}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                  >
                    <div>
                      <p className="text-white font-medium">{sprint.name}</p>
                      <p className="text-gray-400 text-xs capitalize">{sprint.state}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setView("board");
                setSelectedBoard(null);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Back to Boards
            </button>
          </div>
        )}

        {view === "join" && (
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Session</h2>
              <p className="text-gray-400">Enter the session code to join</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Paste session code"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleJoin}
                disabled={!name.trim() || !sessionId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Join Session
              </button>
              <button
                onClick={() => {
                  setView("menu");
                  setName("");
                  setSessionId("");
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
