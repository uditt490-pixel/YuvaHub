import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Search, UserCheck, Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Team, JoinRequest } from '../../models/teamSchema';
import { createTeam, fetchTeams, requestToJoinTeam, fetchTeamRequests, respondToJoinRequest } from '../../services/teamService';
import { Badge } from '../Badge';
import { EmptyState, ErrorState, SkeletonCard } from '../ui/states';

export default function Teams() {
  const { user } = useAppContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('open');

  // Modal / Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeamForJoin, setSelectedTeamForJoin] = useState<Team | null>(null);
  const [selectedTeamForManage, setSelectedTeamForManage] = useState<Team | null>(null);

  // Create Form state
  const [createForm, setCreateForm] = useState({
    name: '',
    opportunityTitle: '',
    description: '',
    requiredRoles: '',
    maxMembers: 4,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Form state
  const [joinForm, setJoinForm] = useState({
    role: '',
    message: '',
  });
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Request Management state
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [manageError, setManageError] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTeams({
        q: searchQuery,
        role: selectedRole,
        status: filterStatus
      });
      setTeams(res.teams || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [searchQuery, selectedRole, filterStatus]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.description || !createForm.requiredRoles) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);
      const rolesArray = createForm.requiredRoles
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      await createTeam({
        name: createForm.name,
        opportunityTitle: createForm.opportunityTitle || undefined,
        description: createForm.description,
        requiredRoles: rolesArray,
        maxMembers: Number(createForm.maxMembers) || 4,
      });

      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        opportunityTitle: '',
        description: '',
        requiredRoles: '',
        maxMembers: 4,
      });
      await loadTeams();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForJoin || !joinForm.role) return;

    try {
      setJoining(true);
      setJoinError(null);
      const teamId = selectedTeamForJoin.id || selectedTeamForJoin._id;
      if (!teamId) return;

      await requestToJoinTeam(teamId, {
        role: joinForm.role,
        message: joinForm.message,
      });

      setJoinSuccess('Join request submitted successfully!');
      setTimeout(() => {
        setSelectedTeamForJoin(null);
        setJoinSuccess(null);
        setJoinForm({ role: '', message: '' });
      }, 1500);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to submit join request');
    } finally {
      setJoining(false);
    }
  };

  const openManageModal = async (team: Team) => {
    setSelectedTeamForManage(team);
    const teamId = team.id || team._id;
    if (!teamId) return;

    try {
      setLoadingRequests(true);
      setManageError(null);
      const res = await fetchTeamRequests(teamId);
      setRequests(res.requests || []);
    } catch (err: any) {
      setManageError(err.message || 'Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setRespondingId(requestId);
      setManageError(null);
      await respondToJoinRequest(requestId, { action });

      setRequests(prev =>
        prev.map(r => ((r.id || r._id) === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r))
      );

      // Refresh teams list to update member counts
      await loadTeams();
    } catch (err: any) {
      setManageError(err.message || 'Failed to update request status');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Team Builder & Teammate Matcher
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Find teammates for upcoming hackathons, research projects, or build your dream squad.
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) {
              alert('Please sign in to create a team.');
              return;
            }
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Create Team
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams by name, hackathon, or project description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter by role/skill (e.g. React)..."
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
          />

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="open">Open Teams</option>
            <option value="closed">Full / Closed</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={loadTeams} />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No teams found"
          description="Be the first to create a team or try adjusting your search filters."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700"
            >
              Create Team
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => {
            const teamId = team.id || team._id || '';
            const isLeader = user && team.leaderUid === user.uid;
            const isMember = user && team.members?.some(m => m.uid === user.uid);
            const isFull = (team.members?.length || 0) >= (team.maxMembers || 4);

            return (
              <div
                key={teamId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  {/* Card Top */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {team.opportunityTitle || 'Hackathon Team'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{team.name}</h3>
                    </div>
                    <Badge variant={team.status === 'open' ? 'status' : 'neutral'}>
                      {team.status === 'open' ? 'Recruiting' : 'Full'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {team.description}
                  </p>

                  {/* Required Roles */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Looking For
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredRoles.map((role, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Members list preview */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      Leader: <span className="text-indigo-600 font-semibold">{team.leaderName}</span>
                    </span>
                    <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100 font-semibold">
                      {team.members?.length || 0} / {team.maxMembers || 4} Members
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {isLeader ? (
                    <button
                      onClick={() => openManageModal(team)}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Manage Join Requests
                    </button>
                  ) : isMember ? (
                    <span className="w-full py-2 bg-green-50 text-green-700 font-semibold rounded-lg text-sm block text-center">
                      ✓ You are a member
                    </span>
                  ) : (
                    <button
                      disabled={isFull || team.status === 'closed'}
                      onClick={() => {
                        if (!user) {
                          alert('Please sign in to submit a join request.');
                          return;
                        }
                        setSelectedTeamForJoin(team);
                        setJoinForm({ role: team.requiredRoles[0] || '', message: '' });
                      }}
                      className={`w-full py-2 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                        isFull || team.status === 'closed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isFull ? 'Team Full' : 'Request to Join'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Create a New Team</h2>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code Ninjas"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Associated Hackathon / Opportunity</label>
                <input
                  type="text"
                  placeholder="e.g. Smart India Hackathon 2026"
                  value={createForm.opportunityTitle}
                  onChange={e => setCreateForm({ ...createForm, opportunityTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Required Roles/Skills (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer, UI/UX Designer, ML Engineer"
                  value={createForm.requiredRoles}
                  onChange={e => setCreateForm({ ...createForm, requiredRoles: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Team Size *</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={createForm.maxMembers}
                    onChange={e => setCreateForm({ ...createForm, maxMembers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Team Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your project idea, goals, or expectations for teammates..."
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Publish Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {selectedTeamForJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Apply to join <span className="text-indigo-600">{selectedTeamForJoin.name}</span>
            </h2>

            {joinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {joinError}
              </div>
            )}

            {joinSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {joinSuccess}
              </div>
            )}

            <form onSubmit={handleJoinRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Role You Excel At *</label>
                <select
                  value={joinForm.role}
                  onChange={e => setJoinForm({ ...joinForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {selectedTeamForJoin.requiredRoles.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Introductory Pitch / Note</label>
                <textarea
                  rows={3}
                  placeholder="Share a link to your GitHub/Portfolio or explain your experience..."
                  value={joinForm.message}
                  onChange={e => setJoinForm({ ...joinForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTeamForJoin(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {joining ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Requests Modal */}
      {selectedTeamForManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Join Requests – {selectedTeamForManage.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Review and accept applicant requests for your team.
                </p>
              </div>
              <button
                onClick={() => setSelectedTeamForManage(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {manageError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {manageError}
              </div>
            )}

            {loadingRequests ? (
              <div className="text-center py-8 text-gray-500">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No join requests received yet.</div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => {
                  const reqId = req.id || req._id || '';
                  return (
                    <div
                      key={reqId}
                      className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{req.applicantName}</span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                            Role: {req.role}
                          </span>
                        </div>
                        {req.message && (
                          <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                            "{req.message}"
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400">Applied on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              disabled={respondingId === reqId}
                              onClick={() => handleRespondRequest(reqId, 'accept')}
                              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              disabled={respondingId === reqId}
                              onClick={() => handleRespondRequest(reqId, 'reject')}
                              className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <Badge variant={req.status === 'accepted' ? 'status' : 'neutral'}>
                            {req.status.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
