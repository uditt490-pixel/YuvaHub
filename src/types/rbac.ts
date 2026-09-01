export type ResourceType = 'USERS' | 'ROLES' | 'REPORTS' | 'SYSTEM_SETTINGS' | 'BILLING';
export type AccessLevel = 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';

export interface Permission {
  resource: ResourceType;
  accessLevels: AccessLevel[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  userCount: number;
  permissions: Permission[];
  createdAt: string;
}

export interface UserRoleAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  department: string;
  assignedRoleId: string;
  assignedAt: string;
  lastActive: string;
}

export interface RbacOverview {
  totalRoles: number;
  activeUsers: number;
  criticalPermissionsGranted: number;
  recentlyModifiedRoles: number;
}
