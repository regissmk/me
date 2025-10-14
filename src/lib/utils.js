import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatInput(value, type) {
  if (!value) return '';

  switch (type) {
    case 'cpf':
      return value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); // Keep only 11 digits
    case 'phone':
      return value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1'); // Keep only 10 or 11 digits
    case 'date':
      return value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{4})\d+?$/, '$1'); // Keep only 8 digits (DD/MM/YYYY)
    default:
      return value;
  }
}

// NEW: Function to get the Flask backend base URL
export function getFlaskBaseUrl() {
  // Adjust this URL based on where your Flask backend is hosted
  // For local development, it's typically http://localhost:5000
  // For production, it would be your backend's domain
  const FLASK_BASE_URL = import.meta.env.VITE_FLASK_BASE_URL || 'http://localhost:5000';
  return FLASK_BASE_URL;
}