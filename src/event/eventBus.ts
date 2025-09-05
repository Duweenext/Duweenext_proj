import { EventType } from "../interfaces/event";


class EventBus {
    private listeners: Map<EventType, Set<Function>> = new Map();

    emit(eventType: EventType, data?: EventData) {
        const eventListeners = this.listeners.get(eventType);

        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    subscribe(eventType: EventType, callback: (data?: EventData) => void) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        this.listeners.get(eventType)!.add(callback);
        return () => {
            this.listeners.get(eventType)?.delete(callback);
        };
    }

    subscribeMultiple(eventTypes: EventType[], callback: (eventType: EventType, data?: EventData) => void) {
        const unsubscribeFunctions = eventTypes.map(eventType =>
            this.subscribe(eventType, (data) => callback(eventType, data))
        );

        return () => {
            unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        };
    }

    getListenerCount(eventType: EventType): number {
        return this.listeners.get(eventType)?.size || 0;
    }

    clear() {
        this.listeners.clear();
    }
}

export const eventBus = new EventBus();


interface EventData {
    boardId?: string;
    relationshipId?: number;
    action?: 'success' | 'error';
    data?: any;
    error?: any;
    [key: string]: any;
}