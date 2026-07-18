import { createId } from '../lib/uuid.js';

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private readonly items = new Map<string, T>();

  constructor(private readonly prefix: string) {}

  async list(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async getById(id: string): Promise<T | null> {
    return this.items.get(id) ?? null;
  }

  async create(item: T): Promise<T> {
    const withId = { ...item, id: item.id || createId(this.prefix) } as T;
    this.items.set(withId.id, withId);
    return withId;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Not found: ${id}`);
    }
    const updated = { ...existing, ...item, id } as T;
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

interface Repository<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
