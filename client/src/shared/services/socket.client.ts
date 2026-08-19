import { io, Socket } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api/v1", "").replace("/api", "")
  : "http://localhost:5000"

let socketInstance: Socket | null = null

export function getSocketClient(): Socket {
  if (!socketInstance) {
    // Auth runs on httpOnly cookies (see shared/config/axios.ts), so the JWT is never
    // readable from JS. Send it via withCredentials so the server can read it off the
    // handshake's cookie header instead of a token the client can't actually provide.
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
    socket.emit("join_station", { stationId })
  }
}

export function unsubscribeFromStation(stationId: string): void {
  const socket = getSocketClient()
  if (socket && stationId) {
    socket.emit("leave_station", { stationId })
  }
}
