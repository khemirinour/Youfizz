<!-- e977d0cb-bcff-4313-919c-d4ba0b747b49 96ef8756-f50d-4bfb-a3a5-c019ab386929 -->
# Add Input Dialog for nbrCmdConf Increment

## Overview

Replace the fixed increment button with a dialog/modal that allows the admin to input a custom number to increment nbrCmdConf by, instead of always incrementing by 1.

## Frontend Changes

### 1. Admin Dashboard (`apps/web-ui/src/app/admin/page.tsx`)

- Replace the direct increment button with a dialog trigger
- Add Dialog component import from `@/components/ui/dialog`
- Add Input and Label component imports if needed
- Add state to manage dialog open/close and increment amount input
- Create a dialog that:
- Shows when admin clicks the increment button
- Has an input field for the increment amount (number type, min 1)
- Shows current nbrCmdConf value
- Has Cancel and Confirm buttons
- On confirm, calls `incrementVendeurNbrCmdConf(userId, amount)` with the entered amount
- Updates the user state after successful increment
- Shows success/error toast notifications

### 2. Implementation Details

- Use Dialog component from ui components
- Input field should be type="number" with min="1"
- Default value can be 1 or empty
- Validate that amount is a positive number
- Close dialog after successful increment
- Update button label/text to indicate it opens a dialog (e.g., "Increment" or "+")

### To-dos

- [ ] Add dialog component with number input for admin to specify increment amount for nbrCmdConf