import { useLocation } from "react-router-dom"

export const useQueueBasePath = (): "/owner" | "/manager" => {
  const { pathname } = useLocation()
  return pathname.startsWith("/owner") ? "/owner" : "/manager"
}
