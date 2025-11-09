import axios from 'axios';

export const http = axios.create({
  timeout: 10_000,
  headers: { 'User-Agent': 'tibia-pulse/1.0 (+educational)' },
});
