import { io, Socket } from "socket.io-client"
import { SOCKET_EVENTS } from "@/shared/constants/socket.const"

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "").replace("/api", "")
  : "http://localhost:5000"

let socketInstance: Socket | null = null

export function getSocketClient(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    })

    socketInstance.on("connect", () => {
      console.log("⚡ [Socket.IO] Real-time connection established:", socketInstance?.id)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("🔌 [Socket.IO] Client disconnected:", reason)
    })
  }

  return socketInstance
}

export function subscribeToStation(stationId: string): void {
  const socket = getSocketClient()
  if (socket && stationId) {
    socket.emit(SOCKET_EVENTS.JOIN_STATION, { stationId })
  }
}

export function unsubscribeFromStation(stationId: string): void {
  const socket = getSocketClient()
  if (socket && stationId) {
    socket.emit(SOCKET_EVENTS.LEAVE_STATION, { stationId })
  }
}

export function subscribeToUser(userId: string): void {
  const socket = getSocketClient()
  if (socket && userId) {
    socket.emit(SOCKET_EVENTS.JOIN_USER, { userId })
  }
}

export function unsubscribeFromUser(userId: string): void {
  const socket = getSocketClient()
  if (socket && userId) {
    socket.emit(SOCKET_EVENTS.LEAVE_USER, { userId })
  }
}
