# Account-based WorkMate persistence

## Goal
Add secure sign-in/sign-up and sign-out, then store each user’s profile and generated emails, meeting summaries, and task plans in Lovable Cloud rather than browser storage.

## User experience
- Add a polished public `/auth` screen with email/password sign-in, account creation, and Google sign-in.
- Protect the WorkMate workspace so signed-out visitors are sent to `/auth` and signed-in users land on `/dashboard`.
- Show the authenticated user’s identity in the sidebar/header and provide a clear sign-out action.
- Preserve the current responsive workspace design and all existing AI tools.
- Show saved work on the relevant Email, Meeting, and Task Planner pages, with the newest item restored and prior items available to reopen or delete.

## Data and security
- Use the new `profiles` table for display name, avatar, and user preferences.
- Use `saved_outputs` for generated emails, meeting summaries, and task plans, including structured task metadata.
- Keep all records scoped to the authenticated account through row-level access rules.
- Perform profile and saved-output operations through authenticated server functions; ownership comes only from the verified session, never client input.
- Replace browser-only persistence for account data; local storage remains limited to non-sensitive transient UI state if needed.

## Implementation
- Add the managed authenticated route layout and move workspace routes beneath it without changing their public URLs.
- Convert `/` into a public session-aware entry route and make `/dashboard` the signed-in home.
- Add reusable account/profile and saved-work server functions.
- Update the app store to hydrate profile/preferences and dashboard statistics from cloud data.
- Save successful Email, Meeting, and Task Planner generations automatically, and persist task status changes.
- Add auth-state cache invalidation and complete sign-out cleanup.

## Verification
- Validate sign-up, sign-in, Google sign-in entry, sign-out, route protection, and redirect behavior.
- Generate one item in each supported tool and confirm it is written with the correct user ID and restored after reload.
- Confirm one user cannot read or modify another user’s records.
- Check responsive desktop/mobile rendering, runtime console errors, and backend security lint results.
