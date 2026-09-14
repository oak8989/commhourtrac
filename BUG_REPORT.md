# Bug Report - VolunteerHub Application

## Critical Bugs Found

### 1. Password Reset Link Not Functional
**Location**: `src/mailer.ts` line 74
**Severity**: HIGH
**Issue**: The password reset email template has a hardcoded `href="#"` instead of using the `resetUrl` parameter.
**Impact**: Users cannot reset their passwords via the email link.

**Fix Required**:
```typescript
// Current (line 74):
<a href="#" style="...">

// Should be:
<a href="${resetUrl || '#'}" style="...">
```

### 2. Invalid Hex Color Handling in CSS Variables
**Location**: `src/App.tsx` lines 37-61
**Severity**: MEDIUM
**Issue**: No validation for hex color before parsing. Invalid colors like "#xyz" will result in NaN values.
**Impact**: CSS variables could be set to invalid values like "#NaNNaNNaN".

**Fix Required**: Add validation before parseInt:
```typescript
if (!/^#[0-9A-Fa-f]{6}$/.test(themeColor)) return;
```

### 3. Stale State in Activity Creation
**Location**: `src/pages/Auth.tsx` line 43
**Severity**: MEDIUM
**Issue**: `addActivity(state, ...)` uses potentially stale `state` instead of functional setState.
**Impact**: Activity log might have incorrect data if state changes between render and setState.

**Fix Required**: Move activity creation inside setState callback.

### 4. Missing Error Handling for Email API Calls
**Location**: `src/pages/Auth.tsx` lines 50-59, 85-94
**Location**: `src/pages/Member.tsx` lines 134-143
**Severity**: MEDIUM
**Issue**: Email API calls have no error handling. If the email server is down, users won't know.
**Impact**: Silent failures, users think emails were sent when they weren't.

**Fix Required**: Add .catch() handlers and show error toasts.

### 5. Insecure Password Reset Token Generation
**Location**: `src/pages/Auth.tsx` line 79
**Severity**: HIGH (Security)
**Issue**: Using `Math.random()` for token generation is not cryptographically secure.
**Impact**: Tokens could be predictable, allowing unauthorized password resets.

**Fix Required**: Use `crypto.getRandomValues()` or a secure random library.

### 6. Password Reset Route Missing
**Location**: `src/pages/Auth.tsx` line 80
**Severity**: HIGH
**Issue**: Reset URL points to `/reset-password?token=${resetToken}` but no route handler exists.
**Impact**: Password reset links don't work even if email is sent correctly.

**Fix Required**: Add route handler for `/reset-password` in App.tsx.

### 7. Inefficient Email API Configuration in Loop
**Location**: `src/pages/Member.tsx` lines 126-146
**Severity**: LOW
**Issue**: `emailAPI.configure()` is called inside forEach loop for each medal email.
**Impact**: Unnecessary repeated configuration calls.

**Fix Required**: Configure once before the loop.

### 8. Simulated Mailer Still in Use
**Location**: `src/store.ts` line 4, `src/mailer.ts` entire file
**Severity**: MEDIUM
**Issue**: The simulated mailer is still being imported and used in store.ts, conflicting with real email server.
**Impact**: Confusion about which email system is active, potential double-sending.

**Fix Required**: Remove simulated mailer usage from store.ts, use only emailAPI.

### 9. Non-null Assertion Without Check
**Location**: `src/pages/Member.tsx` line 173
**Severity**: LOW
**Issue**: `activeCheckin.checkIn!` uses non-null assertion without verification.
**Impact**: Potential runtime error if checkIn is null.

**Fix Required**: Add proper null check or optional chaining.

### 10. Missing Toast Auto-dismiss Cleanup
**Location**: `src/components/UI.tsx` Toast component
**Severity**: LOW
**Issue**: Toast timers might not be cleaned up properly on unmount.
**Impact**: Memory leaks, potential errors if component unmounts before toast dismisses.

**Fix Required**: Ensure timer cleanup in useEffect return function.

## Medium Priority Issues

### 11. Event Status Not Updating in Real-time
**Location**: Multiple components using `getEventStatus()`
**Severity**: MEDIUM
**Issue**: Event status is calculated on render but not updated when time passes.
**Impact**: Events might show wrong status until page refresh.

**Fix Required**: Already partially fixed with tick state, but needs verification.

### 12. Missing Loading States
**Location**: Email operations, API calls
**Severity**: LOW
**Issue**: No loading indicators for async operations.
**Impact**: Poor UX, users might click buttons multiple times.

**Fix Required**: Add loading states and disable buttons during operations.

### 13. No Rate Limiting on Client Side
**Location**: Email sending, registration
**Severity**: LOW
**Issue**: No client-side rate limiting to prevent spam.
**Impact**: Users could spam email sends or registrations.

**Fix Required**: Add debounce/throttle to critical actions.

## Low Priority Issues

### 14. Console Errors in Development
**Location**: Various
**Severity**: LOW
**Issue**: Some console.error calls might expose sensitive information.
**Impact**: Information disclosure in development.

**Fix Required**: Use environment-specific logging.

### 15. Missing Accessibility Labels
**Location**: Various icon buttons
**Severity**: LOW
**Issue**: Some buttons lack aria-labels.
**Impact**: Poor accessibility for screen readers.

**Fix Required**: Add aria-labels to all icon-only buttons.

## Recommended Fix Priority

1. **IMMEDIATE** (Security & Critical):
   - Bug #5: Secure password reset token generation
   - Bug #6: Add password reset route handler
   - Bug #1: Fix password reset email link

2. **HIGH** (Functionality):
   - Bug #2: Add hex color validation
   - Bug #3: Fix stale state in activity creation
   - Bug #4: Add email API error handling

3. **MEDIUM** (Code Quality):
   - Bug #7: Optimize email API configuration
   - Bug #8: Remove simulated mailer conflicts
   - Bug #11: Verify event status updates

4. **LOW** (UX & Polish):
   - Bug #9: Fix non-null assertion
   - Bug #10: Fix toast cleanup
   - Bug #12-15: Add loading states, rate limiting, accessibility

## Testing Recommendations

After fixes:
1. Test password reset flow end-to-end
2. Test color customization with invalid inputs
3. Test email sending with server down
4. Test medal unlock notifications
5. Test event status transitions
6. Test admin deletion protections
7. Test concurrent operations
8. Test mobile responsiveness
9. Test accessibility with screen reader
10. Test browser compatibility
