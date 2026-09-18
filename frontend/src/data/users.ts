export interface MockUser {
  username: string;
  password: string;
  name: string;
  role: string;
}

/**
 * Demo credentials only — there is no real authentication backing this.
 * Anyone opening the login screen can see this and sign in with it.
 */
export const MOCK_USERS: MockUser[] = [
  { username: 'admin', password: 'admin123', name: 'Mahidhar Rao', role: 'Owner / Admin' },
];
