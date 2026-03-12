export type RpsLabel = "rock" | "paper" | "scissor" | "none" | "unknown"

export type DetectRpsResponse = {
  success: boolean
  hand_detected: boolean
  label: RpsLabel
  message?: string
}

export type DetectPoseResponse = {
  success: boolean
  pose_detected: boolean
  label: "rock" | "paper" | "scissor" | "other" | "none" | "unknown"
  confidence?: number
  message?: string
}

export async function detectRps(file: Blob): Promise<DetectRpsResponse> {
  const formData = new FormData()
  formData.append("file", file, "frame.jpg")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detect/rps`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("가위바위보 판정 요청 실패")
  }

  return res.json()
}

export async function detectDbdbd(file: Blob): Promise<DetectPoseResponse> {
  const formData = new FormData()
  formData.append("file", file, "frame.jpg")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detect/dbdbd`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("디비디비딥 판정 요청 실패")
  }

  return res.json()
}