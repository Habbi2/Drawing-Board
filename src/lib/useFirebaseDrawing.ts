import { useEffect, useState, useCallback } from 'react';
import { database } from './firebase';
import { ref, onValue, push, set, remove, serverTimestamp } from 'firebase/database';

export interface DrawingEvent {
  id?: string;
  type: 'draw' | 'clear';
  x?: number;
  y?: number;
  prevX?: number;
  prevY?: number;
  color?: string;
  lineWidth?: number;
  timestamp: number;
  userId: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  activeUsers: number;
}

// Custom hook for managing drawing events with Firebase
export function useFirebaseDrawing() {
  const [events, setEvents] = useState<DrawingEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    activeUsers: 0
  });

  // Listen to drawing events
  useEffect(() => {
    const eventsRef = ref(database, 'drawing/events');
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsList = Object.entries(data).map(([id, event]: [string, any]) => ({
          id,
          ...event
        }));
        // Sort by timestamp to ensure proper order
        eventsList.sort((a, b) => a.timestamp - b.timestamp);
        
        // Only update if events have actually changed
        setEvents(prevEvents => {
          if (prevEvents.length !== eventsList.length || 
              JSON.stringify(prevEvents) !== JSON.stringify(eventsList)) {
            console.log(`Firebase: Loaded ${eventsList.length} drawing events`);
            return eventsList;
          }
          return prevEvents;
        });
      } else {
        console.log('Firebase: No drawing events found, starting with clean canvas');
        setEvents([]);
      }
      setConnectionStatus(prev => ({ ...prev, isConnected: true }));
    }, (error) => {
      console.error('Firebase error:', error);
      setConnectionStatus(prev => ({ ...prev, isConnected: false }));
    });

    return () => unsubscribe();
  }, []);

  // Listen to active users
  useEffect(() => {
    const usersRef = ref(database, 'drawing/activeUsers');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userCount = data ? Object.keys(data).length : 0;
      setConnectionStatus(prev => ({ ...prev, activeUsers: userCount }));
    });

    return () => unsubscribe();
  }, []);

  // Add drawing event
  const addDrawingEvent = useCallback((event: Omit<DrawingEvent, 'timestamp'>) => {
    const eventsRef = ref(database, 'drawing/events');
    push(eventsRef, {
      ...event,
      timestamp: Date.now()
    });
  }, []);

  // Clear all drawing events
  const clearDrawing = useCallback((userId: string) => {
    const eventsRef = ref(database, 'drawing/events');
    const clearEvent: Omit<DrawingEvent, 'timestamp'> = {
      type: 'clear',
      userId
    };
    
    // Remove all events and add clear event
    set(eventsRef, null).then(() => {
      push(eventsRef, {
        ...clearEvent,
        timestamp: Date.now()
      });
    });
  }, []);

  // Register user as active
  const registerUser = useCallback((userId: string) => {
    const userRef = ref(database, `drawing/activeUsers/${userId}`);
    set(userRef, {
      timestamp: Date.now(),
      lastSeen: serverTimestamp()
    });

    // Clean up on disconnect
    return () => {
      remove(userRef);
    };
  }, []);

  return {
    events,
    connectionStatus,
    addDrawingEvent,
    clearDrawing,
    registerUser
  };
}

// Generate a unique user ID
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
