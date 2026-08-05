import { useStationStore } from "@/features/station/store/station.store"
import type { Station } from "@/features/station/types"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

const Booking = () => {
    const [urlQuery] = useSearchParams()
    const stationId = urlQuery.get('stationId')

    const {
        fetchStationById,
        selectedStation
    } = useStationStore()
    
    useEffect(()=>{
    console.log(selectedStation)
    },[])
    
  return (
    <div className="mt-20 min-h-screen text-left">
        <div className="flex flex-column gap-20">

        </div>
    </div>
  )
}

export default Booking