"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ChevronRight, Loader } from "lucide-react";

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
  startDate?: string;
  endDate?: string;
}

interface Issue {
  key: string;
  id: string;
  fields: {
    summary: string;
    description?: string;
    issuetype: {
      name: string;
      iconUrl: string;
    };
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    storyPoints?: number;
  };
}

interface JiraIntegrationProps {
  socket: Socket;
  sessionId: string;
  isHost: boolean;
  onIssueSelected: (boardId: number, sprintId: number, issue: Issue) => void;
  selectedBoardId?: number | null;
  selectedSprintId?: number | null;
}

export default function JiraIntegration({
  socket,
  onIssueSelected,
  selectedBoardId: initialBoardId,
  selectedSprintId: initialSprintId,
}: JiraIntegrationProps) {
  const [step, setStep] = useState<"board" | "sprint" | "issue">(
    initialBoardId && initialSprintId ? "issue" : "board"
  );
  const [boards, setBoards] = useState<Board[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");



  const fetchIssuesForPreSelectedBoard = () => {
    setLoading(true);
    setError("");
    socket.emit("get-issues", initialBoardId, initialSprintId, (data: any) => {
      setLoading(false);
      if (data.success) {
        setIssues(data.issues);
      } else {
        setError(data.error || "Failed to fetch issues");
      }
    });
  };

  const fetchBoards = () => {
    setLoading(true);
    setError("");
    socket.emit("get-boards", (data: any) => {
      setLoading(false);
      if (data.success) {
        setBoards(data.boards);
      } else {
        setError(data.error || "Failed to fetch boards");
      }
    });
  };

  const fetchSprints = (board: Board) => {
    setLoading(true);
    setError("");
    setSelectedBoard(board);
    socket.emit("get-sprints", board.id, (data: any) => {
      setLoading(false);
      if (data.success) {
        const activeSprints = data.sprints.filter((s: Sprint) =>
          ["active", "future"].includes(s.state.toLowerCase())
        );
        setSprints(activeSprints);
        setStep("sprint");
      } else {
        setError(data.error || "Failed to fetch sprints");
      }
    });
  };

  const fetchIssues = (sprint: Sprint) => {
    setLoading(true);
    setError("");
    setSelectedSprint(sprint);
    if (selectedBoard) {
      socket.emit("get-issues", selectedBoard.id, sprint.id, (data: any) => {
        setLoading(false);
        if (data.success) {
          setIssues(data.issues);
          setStep("issue");
        } else {
          setError(data.error || "Failed to fetch issues");
        }
      });
    }
  };

  const handleIssueSelect = (issue: Issue) => {
    const boardId = initialBoardId || selectedBoard?.id;
    const sprintId = initialSprintId || selectedSprint?.id;
    
    if (boardId && sprintId) {
      onIssueSelected(boardId, sprintId, issue);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
        return "bg-green-900 text-green-100";
      case "in progress":
        return "bg-blue-900 text-blue-100";
      case "todo":
        return "bg-gray-700 text-gray-100";
      default:
        return "bg-gray-700 text-gray-100";
    }
  };

    useEffect(() => {
    if (initialBoardId && initialSprintId) {
      // Pre-selected board and sprint, fetch issues directly
      fetchIssuesForPreSelectedBoard();
    } else if (step === "board" && boards.length === 0) {
      fetchBoards();
    }
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Select from Jira</h2>

      {error && <div className="text-red-400 text-sm bg-red-900 bg-opacity-30 p-3 rounded">{error}</div>}

      {/* Boards Selection */}
      {step === "board" && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Boards</h3>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="animate-spin" size={18} />
              Loading boards...
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => fetchSprints(board)}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
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
        </div>
      )}

      {/* Sprints Selection */}
      {step === "sprint" && selectedBoard && (
        <div>
          <button
            onClick={() => {
              setStep("board");
              setSprints([]);
              setSelectedBoard(null);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm mb-3"
          >
            ← Back to Boards
          </button>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Sprints in {selectedBoard.name}
          </h3>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="animate-spin" size={18} />
              Loading sprints...
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  onClick={() => fetchIssues(sprint)}
                  className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
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
        </div>
      )}

      {/* Issues Selection */}
      {step === "issue" && (
        <div>
          {!initialBoardId && !initialSprintId && selectedBoard && selectedSprint && (
            <button
              onClick={() => {
                setStep("sprint");
                setIssues([]);
                setSelectedSprint(null);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm mb-3"
            >
              ← Back to Sprints
            </button>
          )}
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            {initialBoardId && initialSprintId ? "Select Issue" : `Issues in ${selectedSprint?.name}`}
          </h3>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="animate-spin" size={18} />
              Loading issues...
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {issues.length === 0 ? (
                <p className="text-gray-400 text-sm">No issues found</p>
              ) : (
                issues.map((issue) => (
                  <button
                    key={issue.key}
                    onClick={() => handleIssueSelect(issue)}
                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{issue.fields.summary}</p>
                        <p className="text-gray-400 text-xs">{issue.key}</p>
                      </div>
                      <img src={issue.fields.issuetype.iconUrl} alt="" className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.fields.status.name)}`}>
                        {issue.fields.status.name}
                      </span>
                      {issue.fields.assignee && (
                        <span className="text-xs text-gray-400">{issue.fields.assignee.displayName}</span>
                      )}
                      {issue.fields.storyPoints !== undefined && (
                        <span className="text-xs bg-blue-900 text-blue-100 px-2 py-1 rounded">
                          {issue.fields.storyPoints} pts
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
