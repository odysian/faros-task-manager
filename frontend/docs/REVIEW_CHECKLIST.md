# REVIEW_CHECKLIST.md — Task Manager Frontend

Run through this checklist after every implementation session, before committing.

---

## Security

- [ ] No secrets or API keys in committed code
- [ ] `VITE_API_URL` used for backend URL (not hardcoded)
- [ ] User-generated content rendered safely (no `dangerouslySetInnerHTML`)
- [ ] Auth token cleared on 401 response (handled by axios interceptor)
- [ ] Permission checks in UI match backend enforcement (don't show buttons for unauthorized actions)

## API Integration

- [ ] API calls go through service layer (not direct `api.get()` in components)
- [ ] Error responses handled with `error.response?.data?.detail` fallback
- [ ] Loading states prevent double submission
- [ ] AbortController used for search/filter requests that re-trigger
- [ ] File uploads respect size and type limits client-side

## UI / UX

- [ ] New components use `THEME` tokens for inputs, buttons, cards
- [ ] Dark theme colors consistent (zinc-950 bg, zinc-200 text, emerald accents)
- [ ] Loading skeleton or spinner shown during data fetches
- [ ] Empty states have descriptive messages
- [ ] Toast notifications for success, error, and info events
- [ ] Interactive elements disabled during loading
- [ ] Modal backdrops close on click-outside

## Code Quality

- [ ] Components organized in correct domain folder
- [ ] No inline styles — use Tailwind classes
- [ ] Props are destructured in function signature
- [ ] No `console.log` left in committed code (use sparingly for error debugging only)
- [ ] State updates don't cause unnecessary re-renders
- [ ] Cleanup functions in useEffect (abort controllers, intervals, timeouts)
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

## Documentation

- [ ] ARCHITECTURE.md updated if component hierarchy or routing changed
- [ ] PATTERNS.md updated if new convention introduced
- [ ] This checklist updated if new category of checks discovered
