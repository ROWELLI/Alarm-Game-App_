"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const days = [
  { key: "sun", label: "일" },
  { key: "mon", label: "월" },
  { key: "tue", label: "화" },
  { key: "wed", label: "수" },
  { key: "thu", label: "목" },
  { key: "fri", label: "금" },
  { key: "sat", label: "토" },
]

const games = [
  { key: "chamchamcham", label: "참참참", icon: "👆" },
  { key: "dibidibidip", label: "디비디비딥", icon: "🤚" },
  { key: "rps", label: "가위바위보", icon: "✊" },
]

export default function NewAlarmPage() {
  const router = useRouter()
  const [hour, setHour] = useState("20")
  const [minute, setMinute] = useState("00")
  const [isAM, setIsAM] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"])
  const [selectedGame, setSelectedGame] = useState("chamchamcham")
  const [winCount, setWinCount] = useState(3)
  const [volume, setVolume] = useState([50])

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const handleSave = () => {
    // Get existing alarms from localStorage
    const savedAlarms = localStorage.getItem("alarms")
    const existingAlarms = savedAlarms ? JSON.parse(savedAlarms) : []
    
    // Create new alarm
    const newAlarm = {
      id: Date.now(),
      hour: parseInt(hour) || 12,
      minute: parseInt(minute) || 0,
      isAM: isAM,
      days: selectedDays,
      enabled: true,
      game: selectedGame,
      winCount: winCount,
    }
    
    // Save to localStorage
    const updatedAlarms = [...existingAlarms, newAlarm]
    localStorage.setItem("alarms", JSON.stringify(updatedAlarms))
    
    router.push("/alarms")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">알람 설정</h1>

        {/* Time Picker */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="w-20 h-20 text-4xl font-bold text-center border-2 border-[#3B9AE8] rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B9AE8]"
              maxLength={2}
            />
            <span className="text-xs text-muted-foreground mt-1">Hour</span>
          </div>
          <span className="text-4xl font-bold text-foreground">:</span>
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))}
              className="w-20 h-20 text-4xl font-bold text-center border-2 border-muted rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B9AE8]"
              maxLength={2}
            />
            <span className="text-xs text-muted-foreground mt-1">Minute</span>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsAM(true)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isAM
                  ? "bg-[#3B9AE8] text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setIsAM(false)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isAM
                  ? "bg-[#3B9AE8] text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {days.map((day) => (
            <button
              key={day.key}
              onClick={() => toggleDay(day.key)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                selectedDays.includes(day.key)
                  ? "bg-[#3B9AE8] text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Game Selector */}
        <div className="space-y-3 mb-6">
          {games.map((game) => (
            <button
              key={game.key}
              onClick={() => setSelectedGame(game.key)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                selectedGame === game.key
                  ? "border-[#3B9AE8] bg-[#E8F4FD]"
                  : "border-muted bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{game.icon}</span>
                <span className="font-medium text-foreground">{game.label}</span>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </button>
          ))}
        </div>

        {/* Win Count */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#3B9AE8] bg-[#E8F4FD] mb-6">
          <span className="font-medium text-foreground">승리 횟수</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWinCount(Math.max(1, winCount - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-background text-foreground border border-muted"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-foreground">{winCount}</span>
            <button
              onClick={() => setWinCount(Math.min(10, winCount + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-background text-foreground border border-muted"
            >
              +
            </button>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-4 mb-8">
          <Volume2 className="text-muted-foreground" size={24} />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 py-6 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 py-6 rounded-full bg-[#3B9AE8] hover:bg-[#2D89D7] text-white"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}
