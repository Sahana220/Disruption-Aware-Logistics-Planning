/**
 * Live multi-window synchronization using the browser BroadcastChannel API.
 * Channel name: "disruptiondesk"
 * Wrapped in try/catch to fall back silently to single-window mode if unavailable.
 * Echo loops are avoided by tagging each message with a unique window ID.
 */

// Generate a random window ID for this browser tab/window session
const WINDOW_ID = typeof window !== 'undefined'
  ? (window.__DD_WINDOW_ID__ || (window.__DD_WINDOW_ID__ = Math.random().toString(36).substring(2, 10)))
  : 'srv_' + Math.random().toString(36).substring(2, 8);

let channel = null;

try {
  if (typeof globalThis !== 'undefined' && 'BroadcastChannel' in globalThis) {
    channel = new globalThis.BroadcastChannel('disruptiondesk');
  }
} catch (err) {
  console.warn('[BroadcastChannel] Failed to initialize, running in single-window mode:', err);
}

/**
 * Broadcast an event to all other open tabs/windows of the application.
 * Ignores errors silently to prevent blocking any UI or business logic.
 */
export function broadcastEvent(type, payload = {}) {
  try {
    if (!channel) return;
    channel.postMessage({
      senderId: WINDOW_ID,
      type,
      payload,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn('[BroadcastChannel] Failed to broadcast event:', err);
  }
}

/**
 * Subscribe to broadcast events from other windows.
 * Ignores messages sent by the current window to prevent echo loops.
 */
export function subscribeToBroadcast(handler) {
  try {
    if (!channel) return () => {};

    const messageListener = (event) => {
      try {
        if (!event?.data) return;
        // Ignore events sent by this exact window
        if (event.data.senderId === WINDOW_ID) return;
        handler(event.data);
      } catch (err) {
        console.warn('[BroadcastChannel] Error in message listener:', err);
      }
    };

    channel.addEventListener('message', messageListener);
    return () => {
      try {
        channel.removeEventListener('message', messageListener);
      } catch (e) {
        // Silently ignore cleanup error
      }
    };
  } catch (err) {
    console.warn('[BroadcastChannel] Failed to subscribe to channel:', err);
    return () => {};
  }
}

export function getWindowId() {
  return WINDOW_ID;
}
