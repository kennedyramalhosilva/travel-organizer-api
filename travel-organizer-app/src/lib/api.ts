// src/lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3001', // depois a gente troca pra prod
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
