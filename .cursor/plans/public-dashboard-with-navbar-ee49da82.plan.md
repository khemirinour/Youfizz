<!-- ee49da82-409e-4833-b48f-8b9afaaac29d b0ea6744-04cb-42ce-a054-07af0b36a39d -->
# Add Order Form to Article Page

## Overview

Add an order form to the article detail page (`apps/web-ui/src/app/article/[id]/page.tsx`) that allows public users (guests) to place orders for the displayed article.

## Implementation Details

### 1. Create Orders API Functions

- **File**: `apps/web-ui/src/lib/orders.api.ts` (new file)
- Create TypeScript interfaces matching the backend DTOs:
- `OrderItemDto` with `articleId`, `qty`, `price`
- `CreateOrderDto` with `items`, `total`, `customerId`, and optional customer info fields
- Create `createOrder()` function that calls `POST /api/orders`

### 2. Add Order Form Component to Article Page

- **File**: `apps/web-ui/src/app/article/[id]/page.tsx`
- Add order form section below article details
- Form fields:
- Quantity selector (number input, min: 1, max: available stock)
- Customer Name (text input, required)
- Customer Email (email input, required)
- Customer Phone (tel input, optional)
- Customer Address (textarea, optional)
- Calculate total automatically: `quantity * article.price`
- Generate a temporary `customerId` (UUID or timestamp-based) for guest orders
- Include `vendorId` from article if available
- Show form only when article is in stock (`stock > 0`)
- Display "Out of Stock" message when stock is 0

### 3. Form Validation and Submission

- Validate required fields (name, email, quantity)
- Validate quantity doesn't exceed available stock
- Show loading state during submission
- Display success/error messages using toast
- On success, show confirmation message or redirect

### 4. UI/UX Considerations

- Place form in a Card component below article details
- Use existing UI components (Input, Label, Button, etc.)
- Make form responsive
- Disable submit button when stock is 0 or form is invalid
- Show calculated total prominently

## Files to Create/Modify

1. `apps/web-ui/src/lib/orders.api.ts` - New file with order API functions
2. `apps/web-ui/src/app/article/[id]/page.tsx` - Add order form section

## Technical Notes

- Use `uuid` or `crypto.randomUUID()` for generating guest customerId
- Calculate total as: `(parseFloat(article.price) * quantity).toFixed(2)`
- The order endpoint allows guest orders (no auth required)
- Include article vendorId in the order if available
- Validate quantity against article.stock

### To-dos

- [ ] Create orders.api.ts file with CreateOrderDto interfaces and createOrder function
- [ ] Add order form component to article detail page with quantity, customer info fields, and total calculation
- [ ] Add form validation, stock checking, and submission handling with error/success messages