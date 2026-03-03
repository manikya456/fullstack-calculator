import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function calculate({ num1, num2, operation }) {
  const response = await apiClient.post('/api/calculate/', {
    num1,
    num2,
    operation,
  })
  return response.data
}
