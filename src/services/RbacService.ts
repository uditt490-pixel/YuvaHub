import { Role, UserRoleAssignment, RbacOverview } from '../types/rbac';

export class RbacService {
    private static MOCK_ROLES: Role[] = [
        {
            id: 'r_adm_01',
            name: 'Super Admin',
            description: 'Full unrestricted access to all system resources.',
            isSystemRole: true,
            userCount: 4,
            createdAt: '2023-01-15T08:00:00Z',
            permissions: [
                { resource: 'USERS', accessLevels: ['READ', 'WRITE', 'DELETE', 'ADMIN'] },
                { resource: 'ROLES', accessLevels: ['READ', 'WRITE', 'DELETE', 'ADMIN'] },
                { resource: 'REPORTS', accessLevels: ['READ', 'WRITE', 'DELETE', 'ADMIN'] },
                { resource: 'SYSTEM_SETTINGS', accessLevels: ['READ', 'WRITE', 'DELETE', 'ADMIN'] },
                { resource: 'BILLING', accessLevels: ['READ', 'WRITE', 'DELETE', 'ADMIN'] },
            ]
        },
        {
            id: 'r_mgr_02',
            name: 'Compliance Manager',
            description: 'Can view and export all reports and manage billing, but cannot alter users or system settings.',
            isSystemRole: false,
            userCount: 12,
            createdAt: '2023-03-22T14:30:00Z',
            permissions: [
                { resource: 'USERS', accessLevels: ['READ'] },
                { resource: 'REPORTS', accessLevels: ['READ', 'WRITE', 'DELETE'] },
                { resource: 'BILLING', accessLevels: ['READ', 'WRITE'] },
            ]
        },
        {
            id: 'r_usr_03',
            name: 'Standard User',
            description: 'Default role assigned to all general employees.',
            isSystemRole: true,
            userCount: 843,
            createdAt: '2023-01-15T08:00:00Z',
            permissions: [
                { resource: 'REPORTS', accessLevels: ['READ'] },
                { resource: 'USERS', accessLevels: ['READ'] },
            ]
        }
    ];

    public static async getRoles(): Promise<Role[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return this.MOCK_ROLES;
    }

    public static async getRbacOverview(): Promise<RbacOverview> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return {
            totalRoles: this.MOCK_ROLES.length,
            activeUsers: 859,
            criticalPermissionsGranted: 4,
            recentlyModifiedRoles: 1
        };
    }

    public static async getUserAssignments(searchQuery = '', roleIdFilter = 'ALL', page = 1): Promise<{ data: UserRoleAssignment[], total: number }> {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate deterministic users
        const allAssignments: UserRoleAssignment[] = Array.from({ length: 400 }).map((_, i) => ({
            userId: `usr_${i.toString().padStart(4, '0')}`,
            userName: `User ${i + 1} Enterprise`,
            userEmail: `user${i + 1}@entreprise.local`,
            avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
            department: ['Engineering', 'HR', 'Finance', 'Operations', 'Sales'][i % 5],
            assignedRoleId: i < 4 ? 'r_adm_01' : (i < 16 ? 'r_mgr_02' : 'r_usr_03'),
            assignedAt: new Date(Date.now() - (Math.random() * 10000000000)).toISOString(),
            lastActive: new Date(Date.now() - (Math.random() * 86400000)).toISOString()
        }));

        let filtered = allAssignments;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(u => u.userName.toLowerCase().includes(q) || u.userEmail.toLowerCase().includes(q));
        }

        if (roleIdFilter !== 'ALL') {
            filtered = filtered.filter(u => u.assignedRoleId === roleIdFilter);
        }

        const limit = 20;
        const startIndex = (page - 1) * limit;

        return {
            data: filtered.slice(startIndex, startIndex + limit),
            total: filtered.length
        };
    }

    public static async updateRolePermission(roleId: string, resource: string, level: string, granted: boolean): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 500));
        // In strict mock mode, we just return true.
        return true;
    }
}
