'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export default function LocalTime({ 
  date, 
  formatStr = 'dd MMM yyyy, h:mm a',
  className
}: { 
  date: string | Date, 
  formatStr?: string,
  className?: string
}) {
  const [formatted, setFormatted] = useState<string>('')
  
  useEffect(() => {
    setFormatted(format(new Date(date), formatStr))
  }, [date, formatStr])

  // Render the server's guess initially (will be UTC on Vercel), 
  // then client-side effect overwrites it with local browser time.
  // suppressHydrationWarning prevents React warnings about the mismatch.
  return (
    <span className={className} suppressHydrationWarning>
      {formatted || format(new Date(date), formatStr)}
    </span>
  )
}
