export interface Participant {
  id: string;
  name: string;
  socketId: string;
  vote?: string;
}

export interface Session {
  id: string;
  hostId: string;
  participants: Map<string, Participant>;
  currentStory?: string;
  currentIssue?: any;
  isVotingOpen: boolean;
  votes: Map<string, string>;
  revealedVotes: boolean;
  boardId?: number;
  sprintId?: number;
}

export interface SessionState {
  sessionId: string;
  isHost: boolean;
  currentStory?: string;
  currentIssue?: any;
  isVotingOpen: boolean;
  participants: ParticipantState[];
  revealedVotes: boolean;
}

export interface ParticipantState {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
}

export interface JiraBoard {
  id: number;
  key: string;
  name: string;
  type: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
}

export interface JiraIssue {
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
