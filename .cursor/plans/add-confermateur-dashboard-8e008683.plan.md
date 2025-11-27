<!-- 8e008683-0730-426f-9f14-9a79b67ab9ee aa23d48b-54c1-4d4c-9ce2-0d99bf00aac7 -->
# Fix API Role Consistency and Auth Guards

## Issues Identified

1. **Role Name Mismatch**: 

- `apps/cmd/src/app/roles.decorator.ts` uses `'CONFIRMATEUR'` (without 'E')
- Gateway and auth services use `'CONFERMATEUR'` (with 'E')
- This causes authorization failures for confermateur users

2. **GET /orders Endpoint Auth Inconsistency**:

- Gateway requires auth with roles: `['admin', 'vendeur', 'confermateur']`
- CMD controller has no auth guard (public endpoint)
- This creates a security gap

3. **Role Type Definition**:

- Need to ensure consistent role naming across all services

## Files to Fix

### 1. Fix CMD Service Role Definition

- **File**: `apps/cmd/src/app/roles.decorator.ts`
- Change `'CONFIRMATEUR'` to `'CONFERMATEUR'` to match backend enum

### 2. Fix CMD Controller Role References

- **File**: `apps/cmd/src/app/app.controller.ts`
- Update all `@Roles('CONFIRMATEUR')` to `@Roles('CONFERMATEUR')`
- Add auth guard to GET /orders endpoint to match gateway configuration

### 3. Fix CMD Service Role Checks

- **File**: `apps/cmd/src/app/app.service.ts`
- Update role comparison from `'CONFIRMATEUR'` to `'CONFERMATEUR'`

### 4. Verify Gateway Configuration

- **File**: `apps/api-gateway/src/app/gateway.service.ts`
- Already correctly uses `'confermateur'` (lowercase) - no changes needed

## Implementation Details

### Role Name Standard

- Backend enum: `CONFERMATEUR = 'confermateur'` (UserRole enum in auth service)
- Gateway roles: lowercase `'confermateur'`
- CMD decorator: uppercase `'CONFERMATEUR'` (matches enum key)

### GET /orders Auth

- Add `@UseGuards(JwtAuthGuard, RolesGuard)` to GET /orders
- Add `@Roles('ADMIN', 'VENDEUR', 'CONFERMATEUR')` to match gateway
- This ensures consistent security between gateway and service

### To-dos

- [ ] Update roles.decorator.ts to use 'CONFERMATEUR' instead of 'CONFIRMATEUR'
- [ ] Update app.controller.ts to use 'CONFERMATEUR' in all @Roles decorators and add auth guard to GET /orders
- [ ] Update app.service.ts to use 'CONFERMATEUR' in role comparisons