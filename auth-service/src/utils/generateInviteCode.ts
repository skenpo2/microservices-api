import { v4 as uuidV4 } from 'uuid';

export function generateInviteCode() {
  return uuidV4().replace(/-/g, '').substring(0, 8);
}
