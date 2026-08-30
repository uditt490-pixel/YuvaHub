import React, { useState, useEffect, useCallback } from 'react';
import { Role, UserRoleAssignment, RbacOverview } from '../../types/rbac';
import { RbacService } from '../../services/RbacService';
import { PolicyEditor } from '../../components/Enterprise/PolicyEditor';
import { UserRoleTable } from '../../components/Enterprise/UserRoleTable';
import { Shield, Users, KeyRound, Search, Filter, AlertTriangle } from 'lucide-react';

export const RbacManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ROLES' | 'USERS'>('ROLES');

    // Data States
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<UserRoleAssignment[]>([]);
    const [overview, setOverview] = useState<RbacOverview | null>(null);

    // Filter & UI States
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load Initial Base Data
    useEffect(() => {
        const fetchBase = async () => {
            setIsLoading(true);
            const [fetchedRoles, fetchedOverview] = await Promise.all([
                RbacService.getRoles(),
                RbacService.getRbacOverview()
            ]);
            setRoles(fetchedRoles);
            setOverview(fetchedOverview);
            setSelectedRole(fetchedRoles[0]);
            setIsLoading(false);
        };
        fetchBase();
    }, []);

    // Debounced User Load when filters change
    useEffect(() => {
        const fetchUsers = async () => {
            if (activeTab !== 'USERS') return;
            setIsLoading(true);
            const { data, total } = await RbacService.getUserAssignments(searchQuery, roleFilter, page);
            setUsers(data);
            setTotalUsers(total);
            setIsLoading(false);
        };

        const timer = setTimeout(fetchUsers, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, roleFilter, page, activeTab]);

    return (
        <div className="min-h-screen bg-surface p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-blue text-white text-xs font-bold uppercase tracking-wider mb-3">
                            <Shield className="h-3.5 w-3.5" /> Enterprise SecOps
                        </div>
                        <h1 className="text-3xl font-extrabold text-text-primary">Access Management</h1>
                        <p className="text-text-muted mt-1">Configure role-based access policies and audit user assignments.</p>
                    </div>

                    <div className="flex bg-surface rounded-xl shadow-sm p-1 border border-border-theme">
                        <button
                            onClick={() => setActiveTab('ROLES')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'ROLES' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}
                        >
                            Role Policies
                        </button>
                        <button
                            onClick={() => setActiveTab('USERS')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'USERS' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}
                        >
                            User Assignments
                        </button>
                    </div>
                </header>

                {/* Global Overview Metrics */}
                {overview && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-surface p-5 rounded-2xl border border-border-theme flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl"><KeyRound className="h-6 w-6" /></div>
                            <div>
                                <p className="text-xs text-text-muted font-medium tracking-wide uppercase">Defined Roles</p>
                                <p className="text-2xl font-bold text-text-primary mt-0.5">{overview.totalRoles}</p>
                            </div>
                        </div>
                        <div className="bg-surface p-5 rounded-2xl border border-border-theme flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Users className="h-6 w-6" /></div>
                            <div>
                                <p className="text-xs text-text-muted font-medium tracking-wide uppercase">Active Users</p>
                                <p className="text-2xl font-bold text-text-primary mt-0.5">{overview.activeUsers}</p>
                            </div>
                        </div>
                        <div className="bg-surface p-5 rounded-2xl border border-border-theme flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
                            <div>
                                <p className="text-xs text-text-muted font-medium tracking-wide uppercase">Critical Perms</p>
                                <p className="text-2xl font-bold text-text-primary mt-0.5">{overview.criticalPermissionsGranted}</p>
                            </div>
                        </div>
                        <div className="bg-transparent p-5 rounded-2xl border border-dashed border-border-theme flex flex-col justify-center items-center text-center cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                            <span className="text-sm font-semibold text-indigo-400">+ Create Custom Role</span>
                            <span className="text-xs text-text-muted mt-1">Setup bespoke access policies</span>
                        </div>
                    </div>
                )}

                {/* Dynamic Views */}
                <div className="mt-8">
                    {activeTab === 'ROLES' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Role Selection Directory */}
                            <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden shadow-sm lg:col-span-1">
                                <div className="p-4 border-b border-border-theme bg-surface/50">
                                    <h3 className="text-sm font-bold text-text-primary">Role Directory</h3>
                                </div>
                                <ul className="divide-y divide-slate-100">
                                    {roles.map(role => (
                                        <li key={role.id}>
                                            <button
                                                onClick={() => setSelectedRole(role)}
                                                className={`w-full text-left px-5 py-4 transition-colors hover:bg-surface ${selectedRole?.id === role.id ? 'bg-indigo-500/20/50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                                            >
                                                <div className="font-semibold text-sm text-text-primary">{role.name}</div>
                                                <div className="text-xs text-text-muted mt-1 truncate">{role.userCount} users assigned</div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Policy Editor Container */}
                            <div className="lg:col-span-3 space-y-6">
                                {selectedRole ? (
                                    <>
                                        <div className="bg-surface rounded-2xl p-6 border border-border-theme shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-text-primary">{selectedRole.name}</h2>
                                                <p className="text-sm text-text-muted mt-1 max-w-2xl">{selectedRole.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs uppercase tracking-wide text-text-muted font-bold mb-1">Created At</span>
                                                <span className="text-sm font-medium text-text-primary">{new Date(selectedRole.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <PolicyEditor role={selectedRole} />
                                    </>
                                ) : (
                                    <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-dashed border-border-theme">
                                        Select a role to configure policies
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl shadow-sm border border-border-theme">
                                <div className="relative w-full sm:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Filter className="h-5 w-5 text-text-muted hidden sm:block" />
                                    <select
                                        className="w-full sm:w-auto px-4 py-2 bg-surface border border-border-theme text-sm font-medium text-text-primary rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                        value={roleFilter}
                                        onChange={(e) => {
                                            setRoleFilter(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="ALL">All Roles</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <UserRoleTable users={users} roles={roles} isLoading={isLoading} />

                            {!isLoading && totalUsers > 0 && (
                                <div className="flex items-center justify-between px-6 py-4 bg-surface rounded-xl shadow-sm border border-border-theme">
                                    <span className="text-sm font-medium text-text-secondary">Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalUsers)} of {totalUsers} users</span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-border-theme text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={page * 20 >= totalUsers}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-border-theme text-text-secondary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RbacManager;
