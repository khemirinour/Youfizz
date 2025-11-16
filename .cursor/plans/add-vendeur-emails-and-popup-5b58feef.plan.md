<!-- 5b58feef-595e-4002-aae6-bc0e529bf974 b082cbab-4e0e-4cf3-a386-aa8df417f3b7 -->
# Vendor Request Confermateur Assignment via Email

## Overview

Allow vendors to search for confermateurs by email and send them an assignment request. The confermateur receives an email with accept/refuse links that handle the assignment.

## Backend Changes

### 1. API: Find User by Email with Confermateur Role

- **Endpoint**: `GET /auth/users/by-email/:email?role=confermateur`
- **Service Method**: `findUserByEmail(email: string, role?: UserRole)`
- **Returns**: User information if found with specified role
- **Auth**: JWT required

### 2. API: Send Assignment Request Email

- **Endpoint**: `POST /auth/vendeurs/:vendeurId/request-confermateur`
- **Body**: `{ confermateurEmail: string }`
- **Service Method**: `sendConfermateurAssignmentRequest(vendeurId: string, confermateurEmail: string)`
- **Actions**:
- Find confermateur user by email
- Validate confermateur exists and has correct role
- Send email with accept/refuse links containing both user IDs
- Return success message
- **Auth**: JWT required (vendor can only request for themselves)

### 3. API: Accept Assignment Request

- **Endpoint**: `POST /auth/confermateurs/:confermateurId/accept-vendeur/:vendeurId`
- **Service Method**: Uses existing `assignVendeurToConfermateur` method
- **Auth**: Public endpoint (no auth required, as it's accessed via email link)

### 4. API: Refuse Assignment Request

- **Endpoint**: `POST /auth/confermateurs/:confermateurId/refuse-vendeur/:vendeurId`
- **Service Method**: `refuseVendeurAssignment(confermateurId: string, vendeurId: string)`
- **Returns**: Success message
- **Auth**: Public endpoint (no auth required)

### 5. Email Service Extension

- **Method**: `sendConfermateurAssignmentRequestEmail(data: { confermateurEmail: string, confermateurName: string, vendeurName: string, vendeurEmail: string, acceptUrl: string, refuseUrl: string })`
- **Email Content**: HTML email with accept and refuse buttons/links
- **Links Format**: 
- Accept: `${FRONTEND_URL}/api/auth/confermateurs/${confermateurId}/accept-vendeur/${vendeurId}`
- Refuse: `${FRONTEND_URL}/api/auth/confermateurs/${confermateurId}/refuse-vendeur/${vendeurId}`

## Frontend Changes

### 6. Vendor Dashboard UI

- **Location**: `apps/web-ui/src/app/vendor/page.tsx`
- **Feature**: Add section to request confermateur assignment
- **Components**:
- Search input for confermateur email
- Search button
- Display confermateur info if found
- Send request button
- Success/error messages

### 7. API Client Methods

- **File**: `apps/web-ui/src/lib/vendor.api.ts` (or similar)
- **Methods**:
- `findConfermateurByEmail(email: string)`
- `requestConfermateurAssignment(confermateurEmail: string)`

### 8. Accept/Refuse Pages (Optional)

- **Pages**: 
- `/vendor/assignment/accept?confermateurId=...&vendeurId=...`
- `/vendor/assignment/refuse?confermateurId=...&vendeurId=...`
- **Actions**: Call backend APIs and show confirmation message

## Implementation Details

- Email links should use the API gateway URL pattern
- Frontend URL should be configurable via environment variable
- Add proper error handling for all endpoints
- Validate that vendor can only request for themselves
- Prevent duplicate requests (check if already assigned)
- Add rate limiting for email sending

### To-dos

- [ ] Add API endpoint to find user by email with optional role filter
- [ ] Add API endpoint to send assignment request email to confermateur
- [ ] Add public API endpoint to accept assignment request (via email link)
- [ ] Add public API endpoint to refuse assignment request (via email link)
- [ ] Add email service method to send assignment request email with accept/refuse links
- [ ] Add UI in vendor dashboard to search and request confermateur assignment
- [ ] Add frontend API client methods for confermateur search and request
- [ ] Create accept/refuse pages for email link handling (optional)