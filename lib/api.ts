const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000"
  }

  const hostname = window.location.hostname

  // PC에서 localhost로 접속한 경우
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8000"
  }

  // 폰이나 같은 와이파이의 다른 기기에서 접속한 경우
  return `http://${hostname}:8000`
}

const API_BASE_URL = getApiBaseUrl()

export type RpsLabel = "rock" | "paper" | "scissor"
export type CccLabel = "left" | "right" | "front"

export interface RpsResponse {
  success: boolean
  hand_detected: boolean
  label: RpsLabel | null
}

export interface DbdbdResponse {
  success: boolean
  pose_detected: boolean
  label: RpsLabel | "other" | null
  confidence?: number | null
}

export interface CccResponse {
  success: boolean
  face_detected: boolean
  label: CccLabel | null
  confidence?: number | null
  error?: string
}

async function postImage<T>(endpoint: string, blob: Blob): Promise<T> {
  const formData = new FormData()
  formData.append("file", blob, "frame.jpg")

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${endpoint} failed: ${text}`)
  }

  return response.json()
}

export async function detectRps(blob: Blob): Promise<RpsResponse> {
  return postImage<RpsResponse>("/detect/rps", blob)
}

export async function detectDbdbd(blob: Blob): Promise<DbdbdResponse> {
  return postImage<DbdbdResponse>("/detect/dbdbd", blob)
}

export async function detectCcc(blob: Blob): Promise<CccResponse> {
  return postImage<CccResponse>("/detect/ccc", blob)
}