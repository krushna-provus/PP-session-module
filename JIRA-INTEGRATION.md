# Jira Integration Guide

Planning Poker now supports integration with Jira Cloud, allowing you to estimate issues directly and update story points in Jira.

## Setup

### 1. Jira Credentials

You need Jira Cloud API credentials:

#### Get Your API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a descriptive name (e.g., "Planning Poker")
4. Copy the generated token

#### Find Your Email

Use the email associated with your Jira account.

### 2. Configure Environment Variables

In `server/.env`, add your Jira credentials:

```env
JIRA_BASE_URL=https://your-instance.atlassian.net
JIRA_EMAIL=your.email@example.com
JIRA_API_TOKEN=your_api_token_here
JIRA_STORY_POINTS_FIELD=customfield_10016
```

### 3. Find Your Story Points Field ID

The default field ID for Story Points in Jira Cloud is `customfield_10016`, but this may differ based on your Jira configuration.

To find your Story Points field ID:

1. In Jira, go to **Project Settings → Custom Fields**
2. Look for "Story Points" or similar field
3. View the field and note the ID in the URL (e.g., `customfield_10016`)
4. Update `JIRA_STORY_POINTS_FIELD` in your `.env` file

## Usage

### Host Workflow

1. **Create Session** - Start a Planning Poker session
2. **Choose Mode**
   - Click **"Manual Story"** for standard text-based stories
   - Click **"Jira Issue"** to estimate from Jira
3. **Select Jira Issue** (if using Jira mode)
   - Select a **Board**
   - Select a **Sprint** (showing active/future sprints)
   - Select an **Issue** to estimate
4. **Voting** - Team votes on the story points
5. **Reveal** - Click **"Reveal Votes"** to show results
6. **Update Jira** - If estimating a Jira issue, confirm to update story points in Jira
7. **Next Round** - Click **"Reset Round"** to vote on another issue

### Participant Workflow

1. **Join Session** - Enter session ID
2. **Wait for Host** - Host will start voting
3. **Cast Your Vote** - Select a card (0-89 or ?)
4. **See Results** - When host reveals votes, see the estimation
5. **Discuss** - Discuss the results before the next round

## Jira API Permissions

Your Jira user needs these permissions:
- **View Issues** - To see boards, sprints, and issues
- **Edit Issues** - To update story points
- **Access Jira** - Basic API access

> **Note:** The API token can access everything your user can access in Jira. Keep it secure and regenerate it periodically.

## Filtering Issues

The integration automatically filters issues to show:
- Issues in the selected sprint
- Story, Task, and Bug issue types
- Excludes other issue types (Subtask, Epic, etc.)

To customize this, edit the JQL query in `server/jira.ts` in the `getIssues` function.

## Troubleshooting

### "Failed to fetch boards"
- Check that `JIRA_BASE_URL` is correct (no trailing slash)
- Verify `JIRA_EMAIL` and `JIRA_API_TOKEN` are set
- Ensure your API token hasn't expired
- Check your Jira user has API access permissions

### "Failed to update story points"
- Verify `JIRA_STORY_POINTS_FIELD` is correct for your instance
- Ensure your user has permission to edit issues
- Check the issue isn't in a locked workflow state

### Issues not showing in sprint
- The sprint must be in "Active" or "Future" state
- Only Story, Task, and Bug issues are shown
- Your user must have access to the sprint

### "Invalid credentials"
- Double-check `JIRA_EMAIL` (should be your Jira account email)
- Regenerate the API token if it's old
- Ensure no extra whitespace in credentials

## Estimation Workflow Best Practices

1. **Prepare Sprint Planning** - Have your Jira sprint ready with issues
2. **Start Session** - Create a Planning Poker session
3. **Select Issue** - Choose the first issue to estimate
4. **Team Votes** - Everyone votes independently
5. **Discuss Results** - Talk about differences in estimation
6. **Consensus** - Reach a decision on final points
7. **Update Jira** - Host confirms to update story points
8. **Next Issue** - Reset and continue with the next issue

## Security Notes

⚠️ **Important**: API tokens are sensitive credentials
- Never commit `.env` files to version control
- Regenerate tokens if you suspect compromise
- Use a dedicated Jira user for automation if possible
- Rotate API tokens periodically

## API Rate Limiting

Jira Cloud has rate limits (typically 60 requests/minute). The plugin respects these limits:
- Boards list: 1 request per session
- Sprints list: 1 request per board selection
- Issues list: 1 request per sprint selection
- Update story points: 1 request per estimation

For large teams estimating many issues, ensure you stay within rate limits.

## Advanced Configuration

### Custom Issue Filtering

Edit `server/jira.ts` in the `getIssues` function to customize which issues are fetched:

```typescript
// Current JQL
const jql = `sprint = ${sprintId} AND issuetype in (Story, Task, Bug)`;

// Example: Only unestimated issues
const jql = `sprint = ${sprintId} AND issuetype in (Story, Task, Bug) AND "Story Points" is EMPTY`;

// Example: Only high priority
const jql = `sprint = ${sprintId} AND priority >= High AND issuetype in (Story, Task, Bug)`;
```

### Custom Fields

If using custom fields instead of Story Points, update the field ID in `.env`:

```env
JIRA_STORY_POINTS_FIELD=customfield_12345
```

## Limitations

- Only works with Jira Cloud (not Server/Data Center)
- Requires valid API credentials to work
- Cannot create new sprints or issues
- Estimation scope limited to one sprint at a time
- Relies on proper workflow state in Jira

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify Jira credentials and permissions
3. Check browser console for error messages
4. Review server logs for detailed errors

## Examples

### Estimate a user story
1. Select board → sprint → "As a user, I want to..."
2. Team votes
3. Confirm to update story points in Jira

### Sprint planning session
1. Create Planning Poker session
2. Switch to Jira mode
3. Go through each issue in sprint
4. Update story points for each
5. Complete sprint planning efficiently

