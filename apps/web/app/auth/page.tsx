"use client"
import { useState } from "react";
export default function Auth() {
  let [count,setCount] = useState(0)
  return (
    <div>
    <div onClick={()=>setCount(count--)}>-  </div>
    <div>
      {count}
    </div>
    <div onClick={()=>setCount(count++)}>+</div>

    </div>
  );
}
