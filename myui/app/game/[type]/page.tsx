"use client"

import { useEffect, useRef, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { detectDbdbd, detectRps, type RpsLabel } from "@/lib/api"

type GameResult = "WIN" | "LOSE" | "DRAW" | null
type RpsChoice = "rock" | "paper" | "scissor" | null
type GameState = "READY" | "COUNTDOWN" | "RESULT"

const gameData: Record<string, { title: string }> = {
  chamchamcham: { title: "참참참" },
  dibidibidip: { title: "디비디비딥" },
  rps: { title: "가위바위보" },
}

const rpsLabels: Record<string, string> = {
  rock: "주먹",
  paper: "보",
  scissor: "가위",
}

export default function GamePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const pollingRef = useRef(false)

  const initialTargetWins = Number(searchParams.get("winCount") || "3")

  const [winCount, setWinCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [targetWins] = useState(initialTargetWins)
  const [maxAttempts] = useState(20)
  const [result, setResult] = useState<GameResult>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [gameState, setGameState] = useState<GameState>("READY")
  const [countdown, setCountdown] = useState(3)
  const [computerChoice, setComputerChoice] = useState<RpsChoice>(null)
  const [userChoice, setUserChoice] = useState<RpsChoice>(null)
  const [gameOver, setGameOver] = useState(false)
  const [missionClear, setMissionClear] = useState(false)
  const [subjectDetected, setSubjectDetected] = useState(false)

  const game = gameData[type] || gameData.rps

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setCameraReady(true)
          }
        }
      } catch (err) {
        console.error("카메라 접근 실패:", err)
        setCameraReady(false)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const captureFrameBlob = async (): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video) return null
    if (!video.videoWidth || !video.videoHeight) return null

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // UI는 좌우반전 상태로 보여주되, 서버로는 원본 프레임 전송
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9)
    })
  }

  const decideResult = (user: RpsChoice, computer: RpsChoice): GameResult => {
    if (!user || !computer) return "LOSE"
    if (user === computer) return "DRAW"

    if (
      (user === "rock" && computer === "scissor") ||
      (user === "paper" && computer === "rock") ||
      (user === "scissor" && computer === "paper")
    ) {
      return "WIN"
    }

    return "LOSE"
  }

  const detectPresence = async (blob: Blob) => {
    if (type === "rps") {
      const detected = await detectRps(blob)
      return detected.hand_detected
    }

    if (type === "dibidibidip") {
      const detected = await detectDbdbd(blob)
      return detected.pose_detected
    }

    return false
  }

  const detectFinalChoice = async (blob: Blob): Promise<RpsChoice> => {
    if (type === "rps") {
      const detected = await detectRps(blob)
      const label = detected.label
      return detected.hand_detected &&
        (label === "rock" || label === "paper" || label === "scissor")
        ? label
        : null
    }

    if (type === "dibidibidip") {
      const detected = await detectDbdbd(blob)
      const label = detected.label
      return detected.pose_detected &&
        (label === "rock" || label === "paper" || label === "scissor")
        ? label
        : null
    }

    return null
  }

  useEffect(() => {
    if (!cameraReady || gameState !== "READY" || gameOver || missionClear) return
    if (type !== "rps" && type !== "dibidibidip") return

    const interval = setInterval(async () => {
      if (pollingRef.current) return
      pollingRef.current = true

      try {
        const blob = await captureFrameBlob()
        if (!blob) return

        const detected = await detectPresence(blob)
        setSubjectDetected(detected)

        if (detected) {
          setCountdown(3)
          setGameState("COUNTDOWN")
        }
      } catch (error) {
        console.error("감지 polling 실패:", error)
      } finally {
        pollingRef.current = false
      }
    }, 500)

    return () => clearInterval(interval)
  }, [cameraReady, gameState, gameOver, missionClear, type])

  useEffect(() => {
    if (gameState !== "COUNTDOWN") return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }

    const runRound = async () => {
      const choices: RpsChoice[] = ["rock", "paper", "scissor"]
      const compChoice = choices[Math.floor(Math.random() * 3)]
      setComputerChoice(compChoice)

      const blob = await captureFrameBlob()
      if (!blob) {
        setUserChoice(null)
        setResult("LOSE")
        setTotalAttempts((prev) => prev + 1)
        setGameState("RESULT")
        return
      }

      let userCh: RpsChoice = null

      try {
        userCh = await detectFinalChoice(blob)
      } catch (error) {
        console.error("최종 판정 실패:", error)
      }

      setUserChoice(userCh)

      const gameResult = decideResult(userCh, compChoice)
      setResult(gameResult)

      if (gameResult === "WIN") {
        setWinCount((prev) => prev + 1)
      }

      setTotalAttempts((prev) => prev + 1)
      setSubjectDetected(false)
      setGameState("RESULT")
    }

    runRound()
  }, [gameState, countdown])

  useEffect(() => {
    if (winCount >= targetWins) {
      setMissionClear(true)
      setTimeout(() => {
        router.push("/alarms")
      }, 2000)
    } else if (totalAttempts >= maxAttempts) {
      setGameOver(true)
    }
  }, [winCount, totalAttempts, targetWins, maxAttempts, router])

  useEffect(() => {
    if (gameState === "RESULT" && !gameOver && !missionClear) {
      const timer = setTimeout(() => {
        setGameState("READY")
        setResult(null)
        setComputerChoice(null)
        setUserChoice(null)
        setCountdown(3)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [gameState, gameOver, missionClear])

  const getResultStyle = (value: GameResult) => {
    switch (value) {
      case "WIN":
        return "bg-[#3B9AE8] text-white"
      case "LOSE":
        return "bg-red-500 text-white"
      case "DRAW":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getGuideText = () => {
  if (type === "rps") {
    return subjectDetected ? "손 감지됨, 곧 시작합니다" : "손을 보여주세요"
  }
  if (type === "dibidibidip") {
    return subjectDetected
      ? "상체 감지됨, 곧 시작합니다"
      : "상체와 양팔이 보이게 서주세요"
  }
  return "준비해주세요"
}

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/alarms")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">{game.title}</h1>
          </div>
          <Badge variant="outline" className="text-[#3B9AE8] border-[#3B9AE8] px-3 py-1">
            승리 횟수: {winCount}/{targetWins}
          </Badge>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground mb-4">
          <span>시도: {totalAttempts}/{maxAttempts}</span>
          {userChoice && <span>USER: {rpsLabels[userChoice]}</span>}
          {computerChoice && <span>COM: {rpsLabels[computerChoice]}</span>}
        </div>

        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 border-[#3B9AE8] mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {gameState === "COUNTDOWN" && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-7xl font-bold text-yellow-400">{countdown}</span>
            </div>
          )}

          {result && gameState === "RESULT" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`px-8 py-3 text-2xl font-bold ${getResultStyle(result)}`}>
                {result}
              </div>
            </div>
          )}

          {gameState === "READY" && !result && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="text-white text-lg font-bold px-4 py-2 bg-black/50 rounded-lg">
                {getGuideText()}
              </span>
            </div>
          )}

          {missionClear && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-3xl font-bold text-green-400">MISSION CLEAR!</span>
            </div>
          )}

          {gameOver && !missionClear && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-3xl font-bold text-red-400">GAME OVER</span>
            </div>
          )}

          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-3">
              <div className="w-8 h-8 border-4 border-[#3B9AE8] border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">카메라 연결 중...</span>
              <span className="text-xs text-muted-foreground">카메라 권한을 허용해주세요</span>
            </div>
          )}
        </div>

        <div className="text-center text-[#3B9AE8] font-bold text-xl my-3">VS</div>

        <div className="aspect-square bg-background border-2 border-[#3B9AE8] rounded-lg flex items-center justify-center p-6">
          <ComputerGesture choice={computerChoice} type={type} />
        </div>

        {(gameOver || missionClear) && (
          <button
            onClick={() => router.push("/alarms")}
            className="w-full mt-4 py-3 border-2 border-[#3B9AE8] text-[#3B9AE8] rounded-xl font-bold hover:bg-[#3B9AE8]/10 transition-colors"
          >
            알람 목록으로
          </button>
        )}
      </div>
    </div>
  )
}

function ComputerGesture({ choice, type }: { choice: RpsChoice; type: string }) {
  if (type === "dibidibidip") {
    return (
      <div className="text-5xl font-bold">
        {choice === "rock" ? "✊" : choice === "paper" ? "✋" : choice === "scissor" ? "✌️" : "?"}
      </div>
    )
  }

  if (type === "chamchamcham") {
    return (
      <div className="text-4xl font-bold">
        {choice === "rock" ? "←" : choice === "paper" ? "→" : "↑"}
      </div>
    )
  }

  return (
    <div className="text-5xl font-bold">
      {choice === "rock" ? "✊" : choice === "paper" ? "✋" : choice === "scissor" ? "✌️" : "?"}
    </div>
  )
}