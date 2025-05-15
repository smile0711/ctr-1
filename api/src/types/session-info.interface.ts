import { Avatar } from './models';

/** Object resulting from decrypting a valid JWT token */
export interface SessionInfo {
  [key: string]: unknown,
  avatar: Avatar;
  id: number,
}
