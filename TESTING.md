# Testing Drawing History Replay

## Manual Test Steps

### Test 1: Basic Drawing History Replay

1. **Setup**: Open the drawing board in Browser A
2. **Draw**: Create some drawings (lines, different colors, different brush sizes)
3. **Verify**: Open the drawing board in Browser B (or new incognito window)
4. **Expected**: Browser B should show "Loading drawing..." and then display the exact same drawing as Browser A

### Test 2: Real-time Synchronization

1. **Setup**: Have Browser A and Browser B both open and showing the same drawing
2. **Draw**: Draw new strokes in Browser A
3. **Expected**: Browser B should immediately show the new strokes
4. **Draw**: Draw different strokes in Browser B
5. **Expected**: Browser A should immediately show the new strokes

### Test 3: Clear Canvas

1. **Setup**: Have multiple browsers open with existing drawings
2. **Authenticate**: Open moderator panel and authenticate with password
3. **Clear**: Click "Clear Canvas" in moderator panel
4. **Expected**: All browsers should immediately show a blank canvas
5. **Draw**: Create new drawings
6. **Verify**: Open a new browser - it should show the new drawings (not the old ones)

### Test 4: User Connection Tracking

1. **Setup**: Open multiple browser windows/tabs
2. **Verify**: Each browser should show accurate count of active users
3. **Close**: Close some browser windows
4. **Expected**: User count should decrease appropriately

### Test 5: Mobile Touch Support

1. **Setup**: Open on mobile device or use browser dev tools mobile emulation
2. **Draw**: Use touch to draw on the canvas
3. **Expected**: Drawing should work smoothly with touch events
4. **Verify**: Touch drawings should sync to desktop browsers

## Debugging

### Console Messages

Check browser console for these debug messages:
- "Firebase: Loaded X drawing events"
- "Firebase connection status: {...}"
- "Total events loaded: X"
- "Has initialized: true/false"

### Connection Issues

If drawings don't sync:
1. Check Firebase configuration in `.env.local`
2. Verify Firebase database rules allow read/write
3. Check browser console for Firebase errors
4. Ensure internet connection is stable

### Performance Issues

If drawing feels slow:
1. Check network connection
2. Look for console errors
3. Verify Firebase database region is optimal
4. Consider limiting drawing event frequency
