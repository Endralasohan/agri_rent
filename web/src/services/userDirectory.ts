import type { User } from '../types';

const DIRECTORY_STORAGE_KEY = 'agri_rent_user_directory';

function getStoredDirectory(): Record<string, User> {
  try {
    const raw = localStorage.getItem(DIRECTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDirectory(directory: Record<string, User>) {
  try {
    localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
  } catch {
    // ignore
  }
}

/**
 * Register one or more known real users into local directory
 */
export function registerKnownUsers(users: (User | null | undefined)[]) {
  const directory = getStoredDirectory();
  let updated = false;

  for (const u of users) {
    if (!u) continue;

    const existing = (u._id && directory[u._id]) || 
                     (u.phone && directory[`phone_${u.phone}`]) || 
                     (u.name && directory[`name_${u.name.toLowerCase().trim()}`]) || 
                     {};

    const merged: User = {
      ...existing,
      ...u,
      email: (u.email && !u.email.endsWith('@agrirent.in')) ? u.email : (existing.email || ''),
    };

    if (merged._id) {
      directory[merged._id] = merged;
      updated = true;
    }
    if (merged.phone) {
      directory[`phone_${merged.phone}`] = merged;
      updated = true;
    }
    if (merged.name) {
      directory[`name_${merged.name.toLowerCase().trim()}`] = merged;
      updated = true;
    }
  }

  if (updated) {
    saveDirectory(directory);
  }
}

/**
 * Resolve true given user details without ever generating fake random emails
 */
export function resolveUser(target: User | null | undefined): User | null {
  if (!target) return null;

  const directory = getStoredDirectory();
  let matched: User | undefined;

  if (target._id && directory[target._id]) {
    matched = directory[target._id];
  } else if (target.phone && directory[`phone_${target.phone}`]) {
    matched = directory[`phone_${target.phone}`];
  } else if (target.name && directory[`name_${target.name.toLowerCase().trim()}`]) {
    matched = directory[`name_${target.name.toLowerCase().trim()}`];
  }

  const resolved: User = {
    _id: target._id || matched?._id || '',
    name: target.name || matched?.name || 'User',
    phone: target.phone || matched?.phone || '',
    email: (target.email && !target.email.endsWith('@agrirent.in')) ? target.email : (matched?.email || ''),
    role: target.role || matched?.role || 'owner',
    createdAt: target.createdAt || matched?.createdAt,
  };

  return resolved;
}
