export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  message: string
  data: T | null
  error?: {
    code: string
    details?: unknown
  }
}
