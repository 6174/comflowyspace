import { v4 as uuidv4 } from 'uuid';

/**
 * Unique Token for user id
 * @returns {string} uuid  ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
 */
export function uuTokenGenerator(): string {
  return uuidv4();
}

export function uuid(): string {
  return uuidv4();
}
 