import { auth } from '../lib/firebase';
import { Team, CreateTeamInput, JoinRequest, CreateJoinRequestInput, RespondJoinRequestInput } from '../models/teamSchema';

const API_BASE_URL = "/api/v1";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }
  return {
    "Content-Type": "application/json"
  };
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create team");
  }
  return data;
}

export async function fetchTeams(filters?: { opportunityId?: string; q?: string; role?: string; status?: string }): Promise<{ teams: Team[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (filters?.opportunityId) searchParams.append('opportunityId', filters.opportunityId);
  if (filters?.q) searchParams.append('q', filters.q);
  if (filters?.role) searchParams.append('role', filters.role);
  if (filters?.status) searchParams.append('status', filters.status);

  const url = `${API_BASE_URL}/teams?${searchParams.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch teams");
  }
  return data;
}

export async function fetchTeamById(teamId: string): Promise<Team> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch team details");
  }
  return data;
}

export async function requestToJoinTeam(teamId: string, input: CreateJoinRequestInput): Promise<JoinRequest> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/request`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to submit join request");
  }
  return data;
}

export async function fetchTeamRequests(teamId: string): Promise<{ requests: JoinRequest[] }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/requests`, {
    method: 'GET',
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch team requests");
  }
  return data;
}

export async function respondToJoinRequest(requestId: string, input: RespondJoinRequestInput): Promise<{ message: string; status: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/teams/requests/${requestId}/respond`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to respond to join request");
  }
  return data;
}
