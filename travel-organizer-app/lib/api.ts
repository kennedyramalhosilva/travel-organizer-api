// src/lib/api.ts
import axios from 'axios'
import { getToken } from './token'

export const api = axios.create({
  baseURL: 'https://shanda-fatidic-rey.ngrok-free.dev',
  timeout: 5000,
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
