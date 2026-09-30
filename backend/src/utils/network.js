import os from 'node:os';
import axios from 'axios';

export function detectLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal) return entry.address;
    }
  }
  return '127.0.0.1';
}

export function detectMacAddress() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.mac && entry.mac !== '00:00:00:00:00:00') return entry.mac;
    }
  }
  return '00:00:00:00:00:00';
}

export async function detectPublicIp() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
    return response.data?.ip || '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}
