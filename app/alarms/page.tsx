"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Alarm {
  id: number
  hour: number
  minute: number
  isAM: boolean
  days: string[]
  enabled: boolean
  game: string
  winCount: number
}

const dayLabels: Record<string, string> = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
}

const dayIndexMap: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
}

export default function AlarmsPage() {
  const router = useRouter()
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem("alarms")
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms))
    } else {
      const defaultAlarms: Alarm[] = [
        { id: 1, hour: 7, minute: 0, isAM: true, days: ["mon", "tue", "wed", "thu", "fri"], enabled: true, game: "chamchamcham", winCount: 3 },
        { id: 2, hour: 8, minute: 0, isAM: true, days: ["mon", "tue", "wed", "thu", "fri"], enabled: true, game: "dibidibidip", winCount: 3 },
        { id: 3, hour: 8, minute: 0, isAM: true, days: ["mon", "tue", "wed", "thu", "fri"], enabled: false, game: "rps", winCount: 3 },
      ]
      setAlarms(defaultAlarms)
      localStorage.setItem("alarms", JSON.stringify(defaultAlarms))
    }
  }, [])

  // Check time every second
  useEffect(() => {
    const checkAlarm = () => {
      const now = new Date()
      setCurrentTime(now)
      
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentSecond = now.getSeconds()
      const currentDay = dayIndexMap[now.getDay()]

      // Only check at the start of each minute (second 0)
      if (currentSecond !== 0) return

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return
        if (!alarm.days.includes(currentDay)) return

        // Convert alarm time to 24-hour format
        let alarmHour24 = alarm.hour
        if (alarm.isAM && alarm.hour === 12) {
          alarmHour24 = 0
        } else if (!alarm.isAM && alarm.hour !== 12) {
          alarmHour24 = alarm.hour + 12
        }

        if (alarmHour24 === currentHour && alarm.minute === currentMinute) {
          // Alarm triggered! Navigate to game
          router.push(`/game/${alarm.game}?winCount=${alarm.winCount}`)
        }
      })
    }

    const interval = setInterval(checkAlarm, 1000)
    checkAlarm() // Initial check

    return () => clearInterval(interval)
  }, [alarms, router])

  // Save alarms to localStorage when changed
  useEffect(() => {
    if (alarms.length > 0) {
      localStorage.setItem("alarms", JSON.stringify(alarms))
    }
  }, [alarms])

  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ))
  }

  const deleteAlarm = (id: number) => {
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id)
    setAlarms(updatedAlarms)
    localStorage.setItem("alarms", JSON.stringify(updatedAlarms))
  }

  const formatTime = (hour: number, minute: number, isAM: boolean) => {
    const period = isAM ? "오전" : "오후"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return { period, time: `${displayHour}:${minute.toString().padStart(2, "0")}` }
  }

  const getDaysDisplay = (days: string[]) => {
    return days.map(d => dayLabels[d]).join("")
  }

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">알람</h1>
          <button
            onClick={() => router.push("/alarms/new")}
            className="text-[#3B9AE8] hover:opacity-80"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Current Server Time Display */}
        {currentTime && (
          <div className="text-center mb-6 p-3 bg-[#E8F4FD] rounded-xl">
            <p className="text-sm text-muted-foreground">현재 시간</p>
            <p className="text-xl font-bold text-[#3B9AE8]">{formatCurrentTime(currentTime)}</p>
          </div>
        )}

        <div className="space-y-4">
          {alarms.map((alarm) => {
            const { period, time } = formatTime(alarm.hour, alarm.minute, alarm.isAM)
            return (
              <div
                key={alarm.id}
                className={`rounded-2xl p-5 shadow-sm transition-opacity ${
                  alarm.enabled ? "bg-[#E8F4FD]" : "bg-muted opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {getDaysDisplay(alarm.days)}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">{period}</span>
                      <span className="text-3xl font-bold text-foreground">{time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => deleteAlarm(alarm.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                    <Switch
                      checked={alarm.enabled}
                      onCheckedChange={() => toggleAlarm(alarm.id)}
                      className="data-[state=checked]:bg-[#3B9AE8]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
