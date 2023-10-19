"use client"

import { useCallback, useEffect, useState } from "react"
import Record, { RecordData } from "@/classes/record"
import downloadRecords from "@/functions/downloadRecords"
import { DataGrid } from "@mui/x-data-grid"
import { formatDate } from "@/functions/formatDate"
import { CircularProgress } from "@mui/material"

const HomePage = () => {
  const [records, setRecords] = useState<Record[]>([])

  const getRecords = useCallback(async () => {
    const downloadedRecords = await downloadRecords()

    const parsedRecords = downloadedRecords.map(
      (record: object) => new Record(record as RecordData)
    )
    setRecords(parsedRecords)
  }, [])

  useEffect(() => {
    getRecords()
  }, [getRecords])

  const rows = records.map((record, index) => {
    return {
      id: index,
      name: record.name,
      date: formatDate(record.date),
      type: record.type,
      distance: record.distance,
      elapsedTime: Math.round((record.elapsedTime * 1) / 6) / 10,
      totalElevationGain: record.totalElevationGain,
      description: record.description,
    }
  })

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 130,
      headerClassName: "grid_header",
    },
    { field: "date", headerName: "Date", width: 130 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "distance", headerName: "Distance / km", width: 150 },
    { field: "elapsedTime", headerName: "Elapsed time / m", width: 150 },
    { field: "totalElevationGain", headerName: "Elevation / m", width: 130 },
    { field: "description", headerName: "Description", width: 250 },
  ]

  if (records.length === 0)
    return (
      <main className="flex flex-col h-screen w-screen justify-center items-center bg-slate-700">
        <p className="text-white">Loading</p>
        <div className="text-white">
          <CircularProgress color="inherit" />
        </div>
      </main>
    )

  return (
    <main className="flex flex-col items-center p-6 gap-4 h-screen box-border bg-slate-700">
      <h1 className="text-2xl font-bold text-center m-0 text-white">
        AutoRek Strava Club
      </h1>
      <div className="flex-1 w-full max-w-[1200px] box-border">
        <div className="h-full box-border bg-white shadow rounded">
          <DataGrid rows={rows} columns={columns} autoPageSize />
        </div>
      </div>
    </main>
  )
}

export default HomePage
