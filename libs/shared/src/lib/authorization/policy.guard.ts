import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyService, PolicyContext } from './policy.service';

export const POLICY_KEY = 'policy';
export const RESOURCE_KEY = 'resource';

export function RequirePermission(action: string, resource?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(POLICY_KEY, { action, resource }, descriptor.value);
  };
}

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private policyService: PolicyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get policy metadata from the handler
    const policy = this.reflector.get<{ action: string; resource?: string }>(
      POLICY_KEY,
      context.getHandler(),
    );

    if (!policy) {
      // No policy defined, allow access
      return true;
    }

    const policyContext: PolicyContext = {
      user: {
        id: user.userId || user.sub,
        role: user.role,
        email: user.email,
      },
      resource: request.params.id ? { id: request.params.id } : request.body,
      action: policy.action,
      environment: {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        timestamp: new Date(),
      },
    };

    const hasPermission = await this.policyService.checkPermission(policyContext);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions to ${policy.action} ${policy.resource || 'resource'}`,
      );
    }

    return true;
  }
}
