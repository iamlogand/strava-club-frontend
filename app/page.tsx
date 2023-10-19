"use client"

import { useCallback, useEffect, useState } from "react"
import Record, { RecordData } from "@/classes/record"
import downloadRecords from "@/functions/downloadRecords"
import { DataGrid } from "@mui/x-data-grid"
import { formatDate } from "@/functions/formatDate"
import {
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material"
import Aggregate from "@/classes/aggregate"
import { act } from "react-dom/test-utils"

type ActivityType = "Run" | "Walk" | "Ride"

const HomePage = () => {
  const [records, setRecords] = useState<Record[]>([])
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [filter, setFilter] = useState<ActivityType>("Run")
  const [page, setPage] = useState(0)

  const getRecords = useCallback(async () => {
    const downloadedRecords = await downloadRecords()

    const parsedRecords = downloadedRecords.map(
      (record: object) => new Record(record as RecordData)
    )
    setRecords(parsedRecords)
  }, [])

  const getUniqueNames = useCallback(() => {
    const names: string[] = []
    records.forEach((record) => {
      if (!names.includes(record.name)) {
        names.push(record.name)
      }
    })
    return names
  }, [records])

  const getTotal = useCallback(
    (
      name: string,
      field: "distance" | "elapsedTime" | "totalElevationGain"
    ) => {
      let totalDistance: number = 0
      records.forEach((record) => {
        if (record.name == name && record.type == filter) {
          totalDistance += record[field]
        }
      })
      return totalDistance
    },
    [records, filter]
  )

  const getAggregates = useCallback(() => {
    const names = getUniqueNames()
    const aggregates: Aggregate[] = []
    names.forEach((name) => {
      aggregates.push({
        name: name,
        distance: getTotal(name, "distance"),
        elapsedTime: getTotal(name, "elapsedTime"),
        totalElevationGain: getTotal(name, "totalElevationGain"),
      })
    })
    return aggregates
  }, [getTotal, getUniqueNames])

  useEffect(() => {
    getRecords()
  }, [getRecords])

  useEffect(() => {
    setAggregates(getAggregates())
  }, [records, getAggregates])

  const recordRows = records.map((record, index) => {
    return {
      id: index,
      name: record.name,
      date: formatDate(record.date),
      type: record.type,
      distance: Math.round(record.distance) / 1000,
      elapsedTime: Math.round((record.elapsedTime * 1) / 6) / 10,
      totalElevationGain: Math.round(record.totalElevationGain),
      description: record.description,
    }
  })

  const recordColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 130,
      headerClassName: "grid_header",
    },
    { field: "date", headerName: "Date", width: 130 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "distance", headerName: "Distance / km", width: 150 },
    { field: "elapsedTime", headerName: "Elapsed time / min", width: 150 },
    { field: "totalElevationGain", headerName: "Elevation / m", width: 130 },
    { field: "description", headerName: "Description", width: 250 },
  ]

  const aggregateRows = aggregates.map((aggregate, index) => {
    return {
      id: index,
      name: aggregate.name,
      distance: Math.round(aggregate.distance) / 1000,
      elapsedTime: Math.round((aggregate.elapsedTime * 1) / 6) / 10,
      totalElevationGain: Math.round(aggregate.totalElevationGain),
    }
  })

  const aggregateColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 130,
      headerClassName: "grid_header",
    },
    { field: "distance", headerName: "Distance / km", width: 180 },
    { field: "elapsedTime", headerName: "Elapsed time / min", width: 180 },
    { field: "totalElevationGain", headerName: "Elevation / m", width: 180 },
  ]

  const getLink = (
    pageId: number,
    pageTitle: string,
    selectedPageId: number
  ) => (
    <Link
      key={pageId}
      onClick={() => setPage(pageId)}
      className={` decoration-inherit cursor-pointer ${
        selectedPageId === pageId
          ? "text-white font-semibold"
          : "text-inherit no-underline"
      }`}
    >
      {pageTitle}
    </Link>
  )

  const handleChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as ActivityType)
  }

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
    <main className="flex flex-col items-center p-5 gap-5 h-screen box-border bg-slate-700">
      <h1 className="text-2xl font-bold text-center m-0 leading-none text-white">
        AutoRek Strava Club
      </h1>
      <nav className="text-slate-300 mb-1">
        <div className="flex gap-6">
          {getLink(0, "Activities", page)}
          {getLink(1, "Leader Boards", page)}
        </div>
      </nav>
      {page == 0 && (
        <div className="flex-1 w-full max-w-[1200px] box-border bg-white shadow rounded">
          <div className="h-full box-border p-4">
            <DataGrid rows={recordRows} columns={recordColumns} autoPageSize />
          </div>
        </div>
      )}
      {page == 1 && (
        <div className="flex-1 w-full max-w-[1200px] box-border bg-white shadow rounded">
          <div className="h-full flex flex-col p-4 mt-1 gap-4 box-border">
            <div className="flex justify-center">
              <div className="max-w-[200px] flex-1">
                <FormControl fullWidth>
                  <InputLabel id="select-label">Activity Type</InputLabel>
                  <Select
                    labelId="select-label"
                    value={filter}
                    label="Activity Type"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Run"}>Run</MenuItem>
                    <MenuItem value={"Walk"}>Walk</MenuItem>
                    <MenuItem value={"Ride"}>Ride</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex-1 box-border">
              <DataGrid
                rows={aggregateRows}
                columns={aggregateColumns}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "distance", sort: "desc" }],
                  },
                }}
                autoPageSize
              />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default HomePage
