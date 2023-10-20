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
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
} from "@mui/material"
import Aggregate from "@/classes/aggregate"
import { useQueryState } from "next-usequerystate"
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from 'dayjs';

type ActivityType = "Run" | "Walk" | "Ride"

const HomePage = () => {
  const [records, setRecords] = useState<Record[]>([])
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [filter, setFilter] = useQueryState("filter")
  const [tab, setTab] = useQueryState("tab")
  const [startDate, setStartDate] = useQueryState("startDate")
  const [endDate, setEndDate] = useQueryState("endDate")
  const [error, setError] = useState<string | null>(null)

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
        if (
          record.name == name &&
          record.type == filter &&
          (!startDate || record.date >= new Date(startDate as string)) &&
          (!endDate || record.date <= new Date(endDate as string))
        ) {
          totalDistance += record[field]
        }
      })
      return totalDistance
    },
    [records, filter, startDate]
  )

  const getAggregates = useCallback(() => {
    const names = getUniqueNames()
    const aggregates: Aggregate[] = []
    names.forEach((name) => {
      const totalDistance = getTotal(name, "distance")
      const totalElapsedTime = getTotal(name, "elapsedTime")
      const totalElevationGain = getTotal(name, "totalElevationGain")
      if (totalDistance > 0 || totalElapsedTime > 0)
        aggregates.push({
          name: name,
          distance: totalDistance,
          elapsedTime: totalElapsedTime,
          totalElevationGain: totalElevationGain,
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

  const setTabToDefault = useCallback(async () => {
    // Delay rerender to ensure MUI tabs are rendered correctly
    setTimeout(() => {
      setTab("activities")
    }, 100)
  }, [setTab])

  useEffect(() => {
    // Default to activities tab
    if (!tab || (tab !== "activities" && tab !== "leaderBoards"))
      setTabToDefault()
  }, [tab, setTab])

  useEffect(() => {
    // check start date is not after end date
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date")
    } else {
      setError(null)
    }
  }, [startDate, endDate])

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

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as ActivityType)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue.toString())
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
    <main className="flex flex-col items-center p-5 h-screen box-border bg-slate-700">
      <h1 className="text-2xl font-bold text-center m-0 mb-4 leading-none text-white">
        AutoRek Strava Club
      </h1>
      <div className="flex-1 w-full max-w-[1200px] flex flex-col box-border bg-white shadow rounded">
        <nav className="px-4 box-border text-slate-300 bg-slate-200 w-full rounded-t shadow border-0 border-b border-solid border-slate-300">
          <div className="flex gap-6 flex justify-center">
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="basic tabs example"
            >
              <Tab label="Activities" value="activities" />
              <Tab label="Leader Boards" value="leaderBoards" />
            </Tabs>
          </div>
        </nav>
        {(tab === "activities" || tab === null) && (
          <div className="h-full box-border p-4">
            <DataGrid
              rows={recordRows}
              columns={recordColumns}
              initialState={{
                sorting: {
                  sortModel: [{ field: "date", sort: "desc" }],
                },
              }}
              autoPageSize
            />
          </div>
        )}
        {tab === "leaderBoards" && (
          <div className="h-full flex flex-col p-4 mt-2 gap-2 box-border">
            <div className="flex justify-center gap-4 flex-col items-center lg:flex-row">
              <div className="w-full max-w-[259px] flex-1">
                <FormControl fullWidth>
                  <InputLabel id="select-label">Activity Type</InputLabel>
                  <Select
                    labelId="select-label"
                    value={filter as ActivityType}
                    label="Activity Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value={"Run"}>Run</MenuItem>
                    <MenuItem value={"Walk"}>Walk</MenuItem>
                    <MenuItem value={"Ride"}>Ride</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="max-w-[259px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start date"
                    value={dayjs(startDate)}
                    onChange={(newValue) => setStartDate(newValue?.toString() ?? null)}
                    slotProps={{
                      field: {
                        clearable: true,
                        onClear: () => setStartDate(null),
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="max-w-[259px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End date"
                    value={dayjs(endDate)}
                    onChange={(newValue) => setEndDate(newValue?.toString() ?? null)}
                    slotProps={{
                      field: {
                        clearable: true,
                        onClear: () => setEndDate(null),
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>
            {error && (
              <div className="self-center">
                <p className="text-red-500 m-0">{error}</p>
              </div>
            )}
            <div className="flex-1 box-border mt-3">
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
        )}
      </div>
    </main>
  )
}

export default HomePage
