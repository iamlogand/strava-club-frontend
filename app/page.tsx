'use client';

import { useCallback, useEffect, useState } from "react"
import Record from "@/classes/record"
import downloadRecords from "@/functions/downloadRecords"

const HomePage = () => {
  const [records, setRecords] = useState<Record[]>([])
  
  const getRecords = useCallback(async () => {
    const downloadedRecords = await downloadRecords()
    setRecords(downloadedRecords as Record[])
  }, [])

  useEffect( () => {
    getRecords()
  }, [getRecords])

  if (records.length === 0) return <p>Loading...</p>

  return (
    <main>
      <h1 className="text-xl font-bold">AutoRek Strava Club</h1>
      {records.map((record, index) => <p key={index}>{record.name}</p>)}
    </main>
  )
}

export default HomePage
