import { getDb, saveDb } from './mockDb';
import { AuditLog } from '../types';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  async get<T>(table: keyof ReturnType<typeof getDb>): Promise<T[]> {
    await delay();
    const db = getDb();
    return db[table] as unknown as T[];
  },

  async getById<T>(table: keyof ReturnType<typeof getDb>, id: string): Promise<T | undefined> {
    await delay();
    const db = getDb();
    const items = db[table] as any[];
    return items.find(item => item.id === id);
  },

  async create<T extends { id: string }>(table: keyof ReturnType<typeof getDb>, data: Omit<T, 'id'>, userId: string): Promise<T> {
    await delay();
    const db = getDb();
    const newItem = { ...data, id: crypto.randomUUID() } as T;
    
    (db[table] as any[]).push(newItem);
    
    // Log audit
    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId,
      action: 'INSERT',
      tableName: table,
      recordId: newItem.id,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(log);
    
    saveDb(db);
    return newItem;
  },

  async update<T extends { id: string }>(table: keyof ReturnType<typeof getDb>, id: string, data: Partial<T>, userId: string): Promise<T> {
    await delay();
    const db = getDb();
    const items = db[table] as any[];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Record not found');
    
    items[index] = { ...items[index], ...data };
    
    // Log audit
    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId,
      action: 'UPDATE',
      tableName: table,
      recordId: id,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(log);
    
    saveDb(db);
    return items[index];
  },

  async delete(table: keyof ReturnType<typeof getDb>, id: string, userId: string): Promise<void> {
    await delay();
    const db = getDb();
    const items = db[table] as any[];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Record not found');
    
    items.splice(index, 1);
    
    // Log audit
    const log: AuditLog = {
      id: crypto.randomUUID(),
      userId,
      action: 'DELETE',
      tableName: table,
      recordId: id,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.push(log);
    
    saveDb(db);
  }
};
