"use client"
import React from 'react'
import { useState } from 'react'

const page = () => {
    let [count,setCount] = useState(0)
  return (
      <div>
    <div onClick={()=>setCount(count--)}>-</div>
    <div>{count}</div>
    <div onClick={()=>setCount(count--)} className="">+</div>
    </div>
  )
}

export default page