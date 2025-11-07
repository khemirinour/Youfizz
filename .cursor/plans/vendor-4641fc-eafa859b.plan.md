<!-- eafa859b-985b-43c2-893f-8596a326a4a3 c83ab25b-96fb-4fde-b7ec-b426872cd759 -->
# Add vendorId to Create Article Payload

## Overview

The vendorId from the authenticated user should be automatically included when creating an article. Currently, the vendorId is available in the auth store but not being sent in the create article request.

## Implementation

### File to modify:

- `apps/web-ui/src/app/vendor/articles/new/page.tsx`

### Changes:

1. In the `handleSubmit` function, add `vendorId` to the `dataToSend` object when creating the article
2. The vendorId is already available from `useAuthStore()` and is validated before submission (line 52)

### Code Change:

In the `handleSubmit` function (around line 56-60), update `dataToSend` to include `vendorId`:

```typescript
const dataToSend: CreateArticleDto = {
  ...formData,
  vendorId: vendorId, // Add this line
  stock: formData.stock || 0,
  price: formData.price || '0',
};
```

This ensures that when a vendor creates an article, their vendorId is automatically associated with it.