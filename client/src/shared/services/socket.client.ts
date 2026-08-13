import { io, Socket } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "").replace("/api", "")
  : "http://localhost:5000"

let socketInstance: Socket | null = null

export function getSocketClient(): Socket {
  if (!socketInstance) {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || ""

    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: { token },
      query: { token },
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
    socket.emit("join_station", { stationId })
  }
}

export function unsubscribeFromStation(stationId: string): void {
  const socket = getSocketClient()
  if (socket && stationId) {
    socket.emit("leave_station", { stationId })
  }
}
