// Simple in-memory event store (will be replaced with backend later)

export interface EventPhoto {
  id: string;
  dataUrl: string;
  guestName: string;
  timestamp: number;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  hostName: string;
  code: string;
  photos: EventPhoto[];
  createdAt: number;
}

const STORAGE_KEY = 'snapfiesta_events';

function getEvents(): EventData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: EventData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createEvent(name: string, date: string, hostName: string): EventData {
  const events = getEvents();
  const event: EventData = {
    id: crypto.randomUUID(),
    name,
    date,
    hostName,
    code: generateCode(),
    photos: [],
    createdAt: Date.now(),
  };
  events.push(event);
  saveEvents(events);
  return event;
}

export function getEventByCode(code: string): EventData | undefined {
  return getEvents().find(e => e.code.toUpperCase() === code.toUpperCase());
}

export function getEventById(id: string): EventData | undefined {
  return getEvents().find(e => e.id === id);
}

export function addPhotosToEvent(eventId: string, photos: EventPhoto[]): void {
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (event) {
    event.photos.push(...photos);
    saveEvents(events);
  }
}

export function getAllEvents(): EventData[] {
  return getEvents();
}
