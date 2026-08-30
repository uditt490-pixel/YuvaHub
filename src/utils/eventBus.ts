import { EventEmitter } from 'events';

/**
 * Typed Event Bus for decoupled reputation tracking.
 * Allows different parts of the application to emit user actions
 * without tightly coupling them to the reputation system.
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20); // Prevent memory leak warnings
    }

    /**
     * Emits a user action event with associated data.
     * @param eventName - The name of the action (e.g., 'USER_COMPLETED_PROFILE').
     * @param data - Payload containing userId and contextual data.
     */
    emitAction(eventName: string, data: { userId: string;[key: string]: any }) {
        this.emit(eventName, data);
    }
}

export const eventBus = new EventBus();
