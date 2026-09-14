# Bug Fixes Summary

## Critical Bugs Fixed

### 1. App.tsx - Double State Initialization
**Issue**: `loadState()` was called twice on initial render - once in `useState(loadState)` and again in the page state initializer. This caused sample data to be generated twice with different UUIDs, potentially causing state mismatch.

**Fix**: Store the initial state in a separate variable and use it for both state and page initialization.

```typescript
const [initialState] = useState<AppState>(() => loadState());
const [state, setStateRaw] = useState<AppState>(initialState);
const [page, setPage] = useState<Page>(() => {
  if (initialState.currentUser) return initialState.currentUser.role === 'admin' ? 'admin' : 'member';
  return 'landing';
});
```

### 2. Admin.tsx - AttendanceLedger Sorted Memo Dependency
**Issue**: The `sorted` memo depended on `attendees` which was a new array reference on every render, defeating the purpose of `useMemo`.

**Fix**: Changed to use `state.attendance` and `event.id` as dependencies, filtering inside the memo.

```typescript
const sorted = useMemo(() => {
  const eventAttendees = state.attendance.filter(a => a.eventId === event.id);
  return [...eventAttendees].sort(...);
}, [state.attendance, state.users, event.id, sortField, sortDir]);
```

### 3. Admin.tsx - handleCheckOut Missing currentUser Update
**Issue**: When an admin checked themselves out, their `currentUser` wasn't updated with the new hours.

**Fix**: Added `currentUser` update in the `setState` callback.

```typescript
currentUser: prev.currentUser?.id === att.userId 
  ? { ...prev.currentUser, totalHours: prev.currentUser.totalHours + hours } 
  : prev.currentUser,
```

### 4. Admin.tsx - handleCheckIn Walk-in Detection
**Issue**: The function didn't check if a user had a registration before marking them as a walk-in.

**Fix**: Added registration check before creating attendance record.

```typescript
const isRegistered = state.registrations.some(r => r.userId === userId && r.eventId === event.id);
// ...
isWalkIn: !isRegistered
```

### 5. Admin.tsx - EventsView Time-Dependent Filtering
**Issue**: The `filteredEvents` memo used `getEventStatus()` which internally uses `new Date()`, but the memo didn't update as time passed.

**Fix**: Added a tick state that updates every 30 seconds to force re-renders.

```typescript
const [, setTick] = useState(0);
React.useEffect(() => {
  const timer = setInterval(() => setTick(t => t + 1), 30000);
  return () => clearInterval(timer);
}, []);
```

### 6. Member.tsx - QRScanner Stale State
**Issue**: The `setTimeout` callback in `simulateScan` captured `state` and `currentUser` from the closure, which could be stale after 1500ms.

**Fix**: Used functional `setState` to access the latest state via `prev`.

```typescript
setState(prev => {
  const liveEvent = prev.events.find(e => getEventStatus(e) === 'live');
  const userId = prev.currentUser?.id;
  // ... use prev instead of captured state
});
```

### 7. Member.tsx - EventsView Time-Dependent Filtering
**Issue**: Same as Admin.tsx #5 - `visibleEvents` memo didn't update as time passed.

**Fix**: Added tick state for periodic re-renders.

### 8. Member.tsx - handleRegister Stale State
**Issue**: Used `state` from closure for capacity check and activity creation, which could be stale.

**Fix**: Moved all logic inside functional `setState` callback using `prev`.

```typescript
setState(prev => {
  const currentUser = prev.users.find(u => u.id === user.id) || user;
  const alreadyRegistered = prev.registrations.some(...);
  const regs = prev.registrations.filter(r => r.eventId === event.id);
  // ... all logic uses prev
});
```

### 9. Member.tsx - HomeView Check-in/Check-out Stale State
**Issue**: `handleCheckIn` and `handleCheckOut` used `state` and `activeCheckin` from closure.

**Fix**: Used functional `setState` to find active check-in from `prev.attendance`.

```typescript
setState(prev => {
  const currentActive = prev.attendance.find(a => a.userId === user.id && a.checkIn && !a.checkOut);
  if (!currentActive) return prev;
  // ... use currentActive from prev
});
```

### 10. Landing.tsx - Ticker Index Out of Bounds
**Issue**: When `activityLog` length changed, `tickerIndex` could be out of bounds. Also, unused `currentTime` state.

**Fix**: 
- Removed unused `currentTime` state
- Added bounds checking with `safeTickerIndex`
- Early return in useEffect when log is empty

```typescript
const safeTickerIndex = state.activityLog.length > 0 
  ? tickerIndex % state.activityLog.length 
  : 0;
```

## Minor Improvements

### 11. Consistent State Updates
All state updates now use functional form (`setState(prev => ...)`) to avoid stale closures, especially in async operations or callbacks.

### 12. Type Safety
Ensured all TypeScript types are correct and no implicit `any` types.

## Testing Recommendations

1. **First Run**: Verify admin credentials hint appears on first visit
2. **Login/Registration**: Test with admin and member accounts
3. **Live Events**: Verify events transition from upcoming → live → past
4. **Check-in/Check-out**: Test in both admin and member portals
5. **QR Scanner**: Test walk-in check-in functionality
6. **Event Registration**: Test capacity limits and waiver requirements
7. **Settings**: Verify branding changes apply in real-time
8. **Data Persistence**: Refresh page and verify state is preserved
9. **Medal Unlocks**: Verify medals unlock automatically as hours accrue
10. **CSV Exports**: Test attendance and member exports

## Performance Notes

- Bundle size is ~770KB (within acceptable range for this feature set)
- Consider code splitting for production if load times are concerning
- All memos are now properly optimized with correct dependencies
- Time-based updates use 30-second intervals to balance freshness and performance
