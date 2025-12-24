# Investigation Report: Dashboard & Authentication Issues

## 1. Dashboard Widgets Showing Zero Data
**Issue:** "Active Projects", "Completed", "Processed", "Saved", and "Languages" widgets all show 0 or "No data yet".

**Root Cause:**
The `Dashboard.tsx` component fetches statistics with a default duration filter of `'week'` (Last 7 Days).
- **Frontend File:** `frontend/src/pages/Dashboard.tsx` (Lines 224, 227)
  ```typescript
  const [duration, setDuration] = useState('week'); // Defaults to week
  useEffect(() => { fetchStats(duration); }, ...);
  ```
- **Backend File:** `backend/src/controllers/dashboardController.ts` (Lines 17-20)
  ```typescript
  if (duration === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      dateQuery = { createdAt: { $gte: lastWeek } };
  }
  ```
**Explanation:** If all your projects were created more than 7 days ago, they are filtered out by this query, resulting in 0 projects being returned. This also cascades to the "Languages" widget, which calculates distribution based on this filtered list.

## 2. Sidebar Project Count Missing
**Issue:** The project count badge in the sidebar is not visible.

**Root Cause:**
There is a mismatch between the property name expected by the Frontend and the one provided by the Backend.
- **Frontend File:** `frontend/src/components/Layout.tsx` (Line 141)
  ```typescript
  { icon: FileText, label: 'Projects', path: '/projects', badge: stats?.activeProjects }
  ```
  It expects `stats.activeProjects`.
- **Backend File:** `backend/src/controllers/dashboardController.ts` (Lines 184-189)
  ```typescript
  res.json({
      projects: {
          total,
          pending,
          review,
          completed
      },
      // ...
  });
  ```
  It returns a `projects` object. It does **not** return a top-level `activeProjects` field.

## 3. Logout Not Redirecting to Login
**Issue:** Clicking "Logout" clears the session but stays on the current page instead of redirecting to the login screen.

**Root Cause:**
The logout button in the `Layout` component triggers the state cleanup but lacks an explicit navigation command.
- **Frontend File:** `frontend/src/components/Layout.tsx` (Line 315)
  ```typescript
  onClick={logout}
  ```
- **Store File:** `frontend/src/store/useAuthStore.ts` (Line 76)
  The `logout` function only clears the state (`set({ user: null, token: null })`). It does not perform navigation.

**Reliability Issue:** While `ProtectedRoute` *should* theoretically redirect when the user state becomes null, relying solely on reactive state updates for navigation actions initiated by user interaction (like clicking a button) is often unreliable or delayed. Standard practice is to explicitly call `navigate('/login')` immediately after the logout action to ensure a smooth user experience.
