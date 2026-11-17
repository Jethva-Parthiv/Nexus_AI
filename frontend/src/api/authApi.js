// REAL — calls auth-service through gateway-service at VITE_AUTH_API_URL.
import axios from 'axios'

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'

const client = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Normalizes axios errors into a shape the UI can render directly,
// matching auth-service's { message, errors } validation payload.
function normalizeError(error) {
  if (error.response) {
    const { data, status } = error.response
    return {
      status,
      message: data?.message || 'Something went wrong. Please try again.',
      fieldErrors: data?.errors || null,
    }
  }
  if (error.request) {
    return {
      status: 0,
      message: 'Cannot reach auth-service. Is it running on ' + AUTH_API_URL + '?',
      fieldErrors: null,
    }
  }
  return { status: 0, message: error.message, fieldErrors: null }
}

/**
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<{ token: string, username: string, message: string }>}
 */
export async function register(payload) {
  try {
    const { data } = await client.post('/auth/register', payload)
    return data
  } catch (error) {
    throw normalizeError(error)
  }
}

/**
 * @param {{ username: string, password: string }} payload
 * @returns {Promise<{ token: string, username: string, message: string }>}
 */
export async function login(payload) {
  try {
    const { data } = await client.post('/auth/login', payload)
    return data
  } catch (error) {
    throw normalizeError(error)
  }
}
