
import { User } from "../types";

const STORAGE_USERS_KEY = 'melodai_users_db';
const STORAGE_SESSION_KEY = 'melodai_current_session';

export class AuthService {
  private users: Record<string, any> = {};

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (data) {
      try {
        this.users = JSON.parse(data);
      } catch (e) {
        console.error("Failed to load users", e);
      }
    }
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
  }

  public async signup(email: string, password: string, name?: string): Promise<User> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    if (this.users[email.toLowerCase()]) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      createdAt: new Date()
    };

    // Store user with hashed (simulated) password
    this.users[email.toLowerCase()] = {
      ...newUser,
      password: btoa(password) // Simulated hashing
    };

    this.saveUsers();
    this.setSession(newUser);
    return newUser;
  }

  public async login(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const user = this.users[email.toLowerCase()];
    if (!user || user.password !== btoa(password)) {
      throw new Error("Invalid email or password");
    }

    const sessionUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.createdAt)
    };

    this.setSession(sessionUser);
    return sessionUser;
  }

  private setSession(user: User) {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  }

  public getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  public logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}

export const authService = new AuthService();
