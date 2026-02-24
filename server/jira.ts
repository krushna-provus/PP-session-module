import dotenv from "dotenv";
import { JiraBoard, JiraSprint, JiraIssue } from "./types.js";

dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || "https://provusinc.atlassian.net";
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const STORY_POINTS_FIELD = process.env.JIRA_STORY_POINTS_FIELD || "customfield_10016";

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  throw new Error("JIRA_EMAIL and JIRA_API_TOKEN must be set in environment variables");
}

const authHeader = `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`;

async function fetchJira(endpoint: string) {
  const url = `${JIRA_BASE_URL}/rest${endpoint}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<any>;
}

async function getBoards(): Promise<JiraBoard[]> {
  try {
    const data: Record<string, any> = await fetchJira("/agile/1.0/board");
    return data.values || [];
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
}

async function getSprints(boardId: number): Promise<JiraSprint[]> {
  try {
    const data: Record<string, any> = await fetchJira(`/agile/1.0/board/${boardId}/sprint`);
    return data.values || [];
  } catch (error) {
    console.error("Error fetching sprints:", error);
    throw error;
  }
}

async function getIssues(boardId: number, sprintId: number): Promise<JiraIssue[]> {
  try {
    const data: Record<string, any> = await fetchJira(
      `/rest/agile/1.0/sprint/${sprintId}/issue`
    );
    return data.issues || [];
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
}

async function updateIssueStoryPoints(issueId: string, storyPoints: number) {
  try {
    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          [STORY_POINTS_FIELD]: storyPoints,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to update story points: ${response.statusText}. Details: ${errorBody}`
      );
    }

    // JIRA PUT requests often return 204 No Content (empty body)
    // Only parse JSON if there's actual content
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      console.log(`Story points updated successfully for issue ${issueId}: ${storyPoints} points`);
      return { success: true };
    }

    const result = await response.json();
    console.log(`Story points updated successfully for issue ${issueId}: ${storyPoints} points`);
    return result;
  } catch (error) {
    console.error("Error updating story points:", error);
    throw error;
  }
}

export { getBoards, getSprints, getIssues, updateIssueStoryPoints };
