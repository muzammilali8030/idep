import { User } from '../types';

// Keys for local storage simulation
const USERS_KEY = 'fv_users';
const CURRENT_USER_KEY = 'fv_current_user';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // --- Signup ---
  async signup(name: string, email: string, password: string): Promise<User> {
    await delay(800);

    // 1. Validation (Backend simulation)
    if (!email.includes('@')) throw new Error('Invalid email address');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');

    // 2. Check if user exists
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    // 3. Create User (In real backend: Hash password with bcrypt)
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Storing plain text ONLY for this demo. REAL BACKEND MUST HASH THIS.
    };

    // 4. Save to "Database"
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // 5. Create Session (In real backend: Generate JWT)
    const userSession: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: 'mock-jwt-token-' + Date.now()
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
    return userSession;
  },

  // --- Login ---
  async login(email: string, password: string): Promise<User> {
    await delay(800);

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // In real backend: Find user by email, then bcrypt.compare(password, user.passwordHash)
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const userSession: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      token: 'mock-jwt-token-' + Date.now()
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
    return userSession;
  },

  // --- Google Login (Mock) ---
  async loginWithGoogle(): Promise<User> {
    await delay(1000);
    
    // Simulate a successful Google OAuth callback
    const userSession: User = {
      id: 'google-' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      token: 'mock-google-token',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=0D8ABC&color=fff'
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
    return userSession;
  },

  // --- Logout ---
  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // --- Get Current Session ---
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // --- Forgot Password ---
  async resetPassword(email: string): Promise<void> {
    await delay(1000);
    // In real backend: Generate token, save to DB, email link to user
    if (!email.includes('@')) throw new Error('Invalid email');
    return; // Returns success to prevent email enumeration attacks in UI
  }
};