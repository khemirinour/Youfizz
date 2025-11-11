<!-- 8f849c52-a2ab-44ff-bcd9-f917271d1158 e5f89691-92f3-499e-a97f-6a3b55961364 -->
# Fix ImageUpload Component Syntax Error

## Problem

The ImageUpload component has a JSX parsing error that prevents compilation. The issue is caused by:

1. Missing `previews` dependency in `handleUpload` callback (line 130)
2. Potentially problematic `useEffect` cleanup that runs on every `previews` change

## Solution

### 1. Fix handleUpload dependency array

- Add `previews` to the dependency array of `handleUpload` callback (line 130)
- This ensures the callback has access to the current `previews` value

### 2. Fix useEffect cleanup logic

- Change the `useEffect` (lines 133-137) to only run cleanup on unmount
- Store preview URLs in a ref or use a different cleanup strategy
- The current implementation revokes URLs every time `previews` changes, which is incorrect

### 3. Alternative: Use ref for cleanup

- Create a ref to track preview URLs that need cleanup
- Only cleanup on unmount, not on every preview change

## Files to Modify

- `apps/web-ui/src/components/ImageUpload.tsx`
- Fix `handleUpload` dependency array (line 130)
- Refactor `useEffect` cleanup logic (lines 133-137)

## Implementation Details

- Add `previews` to `handleUpload` dependencies: `[selectedFiles, uploading, onUpload, previews]`
- Change `useEffect` to cleanup only on unmount by removing `previews` from dependencies
- Use a ref-based approach or move cleanup logic to only run when component unmounts