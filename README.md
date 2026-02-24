# Planning Poker

A real-time collaborative estimation tool for agile teams. This application allows team members to estimate story points or task complexity using the planning poker methodology.

## Features

- **Real-time collaboration** - Uses Socket.io for instant updates across all participants
- **Session management** - Create sessions and share session codes with team members
- **Multiple estimations** - Fibonacci-based estimation scale (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)
- **Vote reveal** - Host controls when votes are revealed to prevent bias
- **Participant tracking** - See who has voted and their estimations
- **Multiple rounds** - Conduct unlimited voting rounds for different stories
- **Jira Integration** ⭐ - Fetch boards, sprints, and issues from Jira Cloud; estimate and update story points directly
- **Dual Mode** - Estimate both manual stories and Jira issues in the same session

## Architecture

### Client
- **Framework**: Next.js 16 with React 19
- **Type Safety**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io client
- **UI Components**: Custom React components

### Server
- **Framework**: Express.js
- **Type Safety**: TypeScript
- **Real-time**: Socket.io
- **Session Management**: In-memory session storage

## Installation

### Prerequisites
- Node.js 18+ and npm
- Two terminal windows (one for server, one for client)

### Step 1: Install Server Dependencies

```bash
cd server
npm install
```

### Step 2: Install Client Dependencies

```bash
cd client
npm install
```

## Running the Application

### Terminal 1: Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### Terminal 2: Start the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:3000`

Open your browser and navigate to `http://localhost:3000`

## How to Use

### For the Host (Session Creator)

1. Click **"Create Session"** on the home page
2. Enter your name and click **"Create Session"**
3. Copy the Session ID and share it with your team
4. Enter a story/task description in the input field
5. Click **"Start Vote"** to begin the voting round
6. Wait for participants to vote or click **"Reveal Votes"** when ready
7. View the vote summary and discuss results
8. Click **"Reset Round"** to start a new vote

### For Participants (Team Members)

1. Click **"Join Session"** on the home page
2. Enter your name
3. Paste the Session ID provided by the host
4. Click **"Join Session"**
5. Wait for the host to start voting
6. When voting opens, click on a card to submit your estimation
7. Your vote is displayed to the host when they reveal votes
8. Participate in discussion and new rounds as needed

## Jira Integration

Planning Poker supports Jira Cloud integration for seamless estimation workflow.

### Quick Start

1. Set up Jira API credentials in `server/.env`:
   ```env
   JIRA_BASE_URL=https://your-instance.atlassian.net
   JIRA_EMAIL=your.email@example.com
   JIRA_API_TOKEN=your_api_token_here
   ```

2. In a Planning Poker session, select **"Jira Issue"** mode (host only)

3. Select Board → Sprint → Issue to estimate

4. After voting, confirm to update story points in Jira

For detailed setup and usage guide, see [JIRA-INTEGRATION.md](./JIRA-INTEGRATION.md)

### Jira Workflow

- **Select Board** - Choose which Jira board to work with
- **Select Sprint** - Pick an active or future sprint
- **Select Issue** - Choose an issue to estimate (Story, Task, or Bug)
- **Vote & Estimate** - Team estimates the issue using planning poker
- **Update Jira** - Host confirms to save story points back to Jira

## Estimation Scale

The application uses the Fibonacci sequence for estimation:

- **0** - No effort / not needed
- **1** - Trivial task
- **2** - Very small
- **3** - Small
- **5** - Medium
- **8** - Large
- **13** - Very Large
- **21** - Extra Large
- **34-89** - Epic / Multiple stories
- **?** - Unknown / Need more information

## Technical Details

### Socket.io Events

**Client to Server:**
- `create-session` - Create a new session
- `join-session` - Join an existing session
- `start-voting` - Start a voting round (host only)
- `vote` - Submit an estimation vote
- `reveal-votes` - Reveal votes to all participants (host only)
- `reset-votes` - Reset voting round (host only)
- `get-boards` - Fetch Jira boards (host only)
- `get-sprints` - Fetch sprints for a board (host only)
- `get-issues` - Fetch issues in a sprint (host only)
- `start-voting-issue` - Start voting on a Jira issue (host only)
- `update-issue-estimation` - Update story points in Jira (host only)

**Server to Client:**
- `session-updated` - Session state changed
- `host-disconnected` - Host left the session
- `issue-estimation-updated` - Jira issue story points updated

### Session State

Sessions are stored in-memory on the server and include:
- Session ID
- Host ID
- List of participants
- Current story/issue
- Current Jira issue details (if estimating a Jira issue)
- Board ID and Sprint ID (for Jira mode)
- Voting status
- Vote submissions
- Reveal status

## Limitations

- Sessions are lost if the server restarts
- No persistent data storage
- No authentication or authorization
- No password protection on sessions
- Limited to in-memory session storage
- Jira integration requires valid Cloud API credentials
- Story points field ID must be configured correctly for your Jira instance
- Cannot create new sprints or issues (estimation only)

## Future Enhancements

- Database persistence for session history
- User authentication and authorization
- Private sessions with passwords
- Session history and export
- Custom estimation scales
- Integration with Azure DevOps
- Chat functionality during estimation
- Undo/Redo functionality
- Team analytics and reports
- Bulk issue estimation from Jira
- Automatic re-estimation triggers

## License

ISC
