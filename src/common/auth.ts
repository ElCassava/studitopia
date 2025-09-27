 // Custom username-based authentication utilities using Supabase
// Usage: import { register, login, logout, getCurrentUser } from './auth';
import { getSupabaseClient } from './network';

const supabase = getSupabaseClient();

// Interface for user data
export interface User {
  id: string;
  username: string;
  created_at: string;
}

// Register a new user with username and password
export async function register(username: string, password: string) {
  try {
    // Check if username already exists (case-insensitive)
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .ilike('username', username)
      .single();

    if (existingUser) {
      return { error: { message: 'Username already exists' } };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      username: username.toLowerCase(), // Store username in lowercase
      password_hash: hashedPassword,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      return { error: { message: `Registration failed: ${error.message}` } };
    }
    return { data, error: null };
  } catch (error) {
    return { error: { message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` } };
  }
}

// Login with username and password
export async function login(username: string, password: string) {
  try {
    // Get user by username (case-insensitive search)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username) // Use ilike for case-insensitive search
      .single();

    if (userError) {
      // Check if it's a "not found" error
      if (userError.code === 'PGRST116') {
        return { error: { message: 'User not found. Please check your username or register first.' } };
      }
      return { error: { message: `Database error: ${userError.message}` } };
    }

    if (!user) {
      return { error: { message: 'User not found. Please check your username or register first.' } };
    }

    // Verify password - check if using hashed or plain text password
    let isValidPassword = false;
    
    // Check if the user has a password_hash field (new system) or password field (existing system)
    if (user.password_hash) {
      // New hashed password system
      isValidPassword = await verifyPassword(password, user.password_hash);
    } else if (user.password) {
      // Existing plain text password system
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return { error: { message: 'Invalid password. Please check your password.' } };
    }

    // Store user session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }));
    }

    return { 
      data: { 
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at
        }
      }, 
      error: null 
    };
  } catch (error) {
    return { error: { message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}` } };
  }
}

// Logout current user
export async function logout() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    return { error: null };
  } catch (error) {
    return { error: { message: 'Logout failed' } };
  }
}

// Get current logged-in user
export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
}

// Simple password hashing (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify password against hash
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}
