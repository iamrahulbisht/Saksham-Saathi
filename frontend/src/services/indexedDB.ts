import Dexie, { Table } from 'dexie';

// --- Interfaces ---
export interface Student {
    id: string; // Local UUID if unsynced, Server UUID if synced
    name: string;
    age: number;
    grade: number;
    assigned_teacher_id?: string;
    synced: boolean;
    lastModified: string;
}

export interface SyncQueueItem {
    id?: string; // UUID
    dataType: 'student' | 'assessment' | 'game' | 'cognitive_event' | 'api_call';
    operation: 'create' | 'update' | 'delete';
    payload: any;
    queuedAt: string;
    synced: boolean;
    retryCount: number;
    lastError?: string;
}

// ... Additional interfaces (Assessment, etc.) ...
export interface Assessment {
    id?: string;
    studentId: string;
    data: any;
    synced: boolean;
    completedAt: string;
}

class SakshamSaathiDB extends Dexie {
    students!: Table<Student, string>;
    assessments!: Table<Assessment, string>;
    sync_queue!: Table<SyncQueueItem, string>;

    constructor() {
        super('SakshamSaathiDB');
        this.version(1).stores({
            students: 'id, assigned_teacher_id, synced',
            assessments: 'uuid, studentId, synced',
            sync_queue: 'id, dataType, synced, queuedAt',
            users: 'id' // Add users table
        });
    }
    users!: Table<any, string>; // Add users prop
}

export const db = new SakshamSaathiDB();

// --- Queue Helpers ---
export async function saveToSyncQueue(dataType: string, operation: string, payload: any) {
    return db.sync_queue.add({
        id: crypto.randomUUID(),
        dataType: dataType as any,
        operation: operation as any,
        payload,
        queuedAt: new Date().toISOString(),
        synced: false,
        retryCount: 0
    });
}

export async function getUnsyncedItems() {
    return db.sync_queue.filter(item => item.synced === false).sortBy('queuedAt');
}

export async function markAsSynced(itemId: string) {
    // We delete form queue on success usually, or mark synced
    // Deleting helps keep DB small.
    await db.sync_queue.delete(itemId);
}
