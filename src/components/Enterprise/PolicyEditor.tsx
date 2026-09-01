import React, { useState } from 'react';
import { Role, ResourceType, AccessLevel } from '../../types/rbac';
import { RbacService } from '../../services/RbacService';
import { Check, X, ShieldAlert, Lock, Unlock } from 'lucide-react';

interface PolicyEditorProps {
    role: Role;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ role }) => {
    const [localRole, setLocalRole] = useState<Role>(role);
    const [isSaving, setIsSaving] = useState(false);

    const RESOURCES: ResourceType[] = ['USERS', 'ROLES', 'REPORTS', 'SYSTEM_SETTINGS', 'BILLING'];
    const LEVELS: AccessLevel[] = ['READ', 'WRITE', 'DELETE', 'ADMIN'];

    const hasPermission = (resource: ResourceType, level: AccessLevel) => {
        return localRole.permissions.some(p => p.resource === resource && p.accessLevels.includes(level));
    };

    const togglePermission = async (resource: ResourceType, level: AccessLevel) => {
        // If it's a system role (like Super Admin), prevent edits in UI as a safeguard
        if (localRole.isSystemRole && localRole.name === 'Super Admin') return;

        setIsSaving(true);
        const currentlyHas = hasPermission(resource, level);

        // Optimistic UI Update
        setLocalRole(prev => {
            const perms = [...prev.permissions];
            const existing = perms.findIndex(p => p.resource === resource);

            if (existing >= 0) {
                let levels = [...perms[existing].accessLevels];
                if (currentlyHas) {
                    levels = levels.filter(l => l !== level);
                } else {
                    levels.push(level);
                }
                perms[existing] = { ...perms[existing], accessLevels: levels };
            } else {
                perms.push({ resource, accessLevels: [level] });
            }
            return { ...prev, permissions: perms };
        });

        await RbacService.updateRolePermission(localRole.id, resource, level, !currentlyHas);
        setIsSaving(false);
    };

    return (
        <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden">
            <div className="bg-surface px-6 py-4 border-b border-border-theme flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-semibold text-text-primary">Policy Configuration Map</h3>
                    <p className="text-xs text-text-muted mt-1">Configure fine-grained access control levels for specific modules.</p>
                </div>
                {localRole.isSystemRole && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30 text-xs font-medium text-amber-400">
                        <ShieldAlert className="h-3.5 w-3.5" /> Core System Role
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface border-b border-border-theme text-xs font-semibold text-text-muted uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold text-text-secondary">Resource Module</th>
                            {LEVELS.map(lvl => (
                                <th key={lvl} className="px-6 py-4 text-center">{lvl}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {RESOURCES.map(res => (
                            <tr key={res} className="hover:bg-surface/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-sm text-text-primary">
                                    {res.replace('_', ' ')}
                                </td>
                                {LEVELS.map(lvl => {
                                    const allowed = hasPermission(res, lvl);
                                    const isSuperAdmin = localRole.name === 'Super Admin';
                                    return (
                                        <td key={lvl} className="px-6 py-4 text-center align-middle relative">
                                            <button
                                                onClick={() => togglePermission(res, lvl)}
                                                disabled={isSuperAdmin || isSaving}
                                                className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center transition-all ${allowed
                                                        ? 'bg-emerald-500/200/20 text-emerald-400 hover:bg-emerald-200 border-2 border-emerald-500/30'
                                                        : 'bg-surface-secondary text-text-muted hover:bg-border-theme border-2 border-transparent'
                                                    } ${isSuperAdmin ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {allowed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-surface border-t border-border-theme flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Changes take effect at next user session refresh.
                </div>
                {isSaving && <span className="animate-pulse text-indigo-400 font-medium">Saving policy...</span>}
            </div>
        </div>
    );
};
