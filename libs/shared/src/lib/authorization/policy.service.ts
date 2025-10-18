import { Injectable, Logger } from '@nestjs/common';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface PolicyContext {
  user: {
    id: string;
    role: string;
    email: string;
  };
  resource?: any;
  action: string;
  environment?: Record<string, any>;
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);
  private readonly rolePermissions = new Map<string, Permission[]>();

  constructor() {
    this.initializePermissions();
  }

  private async initializePermissions(): Promise<void> {
    // Initialize default permissions
    const defaultPermissions: Permission[] = [
      { id: 'user:read', name: 'Read User', resource: 'user', action: 'read' },
      { id: 'user:write', name: 'Write User', resource: 'user', action: 'write' },
      { id: 'user:delete', name: 'Delete User', resource: 'user', action: 'delete' },
      { id: 'article:read', name: 'Read Article', resource: 'article', action: 'read' },
      { id: 'article:write', name: 'Write Article', resource: 'article', action: 'write' },
      { id: 'article:delete', name: 'Delete Article', resource: 'article', action: 'delete' },
      { id: 'order:read', name: 'Read Order', resource: 'order', action: 'read' },
      { id: 'order:write', name: 'Write Order', resource: 'order', action: 'write' },
      { id: 'order:delete', name: 'Delete Order', resource: 'order', action: 'delete' },
    ];

    // Initialize default roles
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        permissions: defaultPermissions,
        isActive: true,
      },
      {
        id: 'vendeur',
        name: 'Vendeur',
        permissions: defaultPermissions.filter(p => 
          p.resource === 'article' || p.resource === 'order'
        ),
        isActive: true,
      },
      {
        id: 'confermateur',
        name: 'Confermateur',
        permissions: defaultPermissions.filter(p => 
          p.resource === 'order' && p.action === 'read'
        ),
        isActive: true,
      },
      {
        id: 'guest',
        name: 'Guest',
        permissions: defaultPermissions.filter(p => 
          p.resource === 'article' && p.action === 'read'
        ),
        isActive: true,
      },
    ];

    // Store in memory for now (in production, this would be in database)
    for (const role of defaultRoles) {
      this.rolePermissions.set(role.id, role.permissions);
    }
  }

  async checkPermission(context: PolicyContext): Promise<boolean> {
    try {
      const userPermissions = this.rolePermissions.get(context.user.role);
      
      if (!userPermissions) {
        this.logger.warn(`No permissions found for role: ${context.user.role}`);
        return false;
      }

      // Check if user has the required permission
      const hasPermission = userPermissions.some(permission => {
        const resourceMatch = permission.resource === context.resource?.constructor?.name?.toLowerCase() || 
                            permission.resource === context.resource;
        const actionMatch = permission.action === context.action;
        
        return resourceMatch && actionMatch;
      });

      if (!hasPermission) {
        this.logger.warn(`Permission denied for user ${context.user.id} on ${context.resource} ${context.action}`);
        return false;
      }

      // Additional context-based checks
      if (context.resource && typeof context.resource === 'object') {
        return this.checkResourceOwnership(context);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking permission: ${error.message}`, error.stack);
      return false;
    }
  }

  private checkResourceOwnership(context: PolicyContext): boolean {
    // Check if user owns the resource (for user-specific resources)
    if (context.resource && context.resource.userId) {
      return context.resource.userId === context.user.id;
    }

    // Check if user created the resource
    if (context.resource && context.resource.createdBy) {
      return context.resource.createdBy === context.user.id;
    }

    // Admin can access all resources
    if (context.user.role === 'admin') {
      return true;
    }

    // Default to false for security
    return false;
  }

  async getUserPermissions(userId: string, role: string): Promise<Permission[]> {
    const permissions = this.rolePermissions.get(role) || [];
    this.logger.debug(`Retrieved ${permissions.length} permissions for user ${userId} with role ${role}`);
    return permissions;
  }

  async addPermissionToRole(roleId: string, permission: Permission): Promise<void> {
    const rolePermissions = this.rolePermissions.get(roleId) || [];
    rolePermissions.push(permission);
    this.rolePermissions.set(roleId, rolePermissions);
    this.logger.log(`Added permission ${permission.name} to role ${roleId}`);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const rolePermissions = this.rolePermissions.get(roleId) || [];
    const filteredPermissions = rolePermissions.filter(p => p.id !== permissionId);
    this.rolePermissions.set(roleId, filteredPermissions);
    this.logger.log(`Removed permission ${permissionId} from role ${roleId}`);
  }

  async validateUserRole(userId: string, requiredRole: string): Promise<boolean> {
    // In production, this would validate against the database
    // For now, we'll assume the role is valid if it exists in our map
    return this.rolePermissions.has(requiredRole);
  }
}
