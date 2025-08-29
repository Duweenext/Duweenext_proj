export type EventType =
    | BoardEventType
    | SensorEventType;

type BoardEventType =
    | 'board-frequency-updated'
    | 'board-connection-updated'
    | 'board-added'
    | 'board-deleted';

type SensorEventType =
    | 'board-threshold-updated';