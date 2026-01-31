import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a cryptographically secure random character from a given string
 */
function getRandomChar(chars: string): string {
  const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * chars.length);
  return chars[randomIndex];
}

/**
 * Shuffles a string using Fisher-Yates algorithm
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Generates a secure random 16-character password
 * Includes: numbers, lowercase letters, uppercase letters, and special characters
 * Ensures at least one character from each category
 */
export function generatePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + special;
  
  // Ensure at least one from each category
  let password = '';
  password += getRandomChar(lowercase);
  password += getRandomChar(uppercase);
  password += getRandomChar(numbers);
  password += getRandomChar(special);
  
  // Fill remaining 12 characters randomly
  for (let i = 4; i < 16; i++) {
    password += getRandomChar(allChars);
  }
  
  // Shuffle the password to avoid predictable pattern
  return shuffleString(password);
}
