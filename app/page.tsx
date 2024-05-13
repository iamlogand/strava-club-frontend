"use client"

import { useCallback, useEffect, useState } from "react"
import Record, { RecordData } from "@/classes/record"
import downloadJsonData from "@/functions/downloadRecords"
import { GridCellParams, GridSortModel } from "@mui/x-data-grid"
import formatDate from "@/functions/formatDate"
import {
  Button,
  CircularProgress,
  Link,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
} from "@mui/material"
import Aggregate from "@/classes/aggregate"
import { useQueryState } from "next-usequerystate"
import useLocalStorage from "@/functions/useLocalStorage"
import getPace from "@/functions/getPace"
import formatMinutesToTime from "@/functions/formatTime"
import ActivityType from "@/types/ActivityType"
import React from "react"
import RecordsTab from "@/components/recordsTab"
import AggregatesTab from "@/components/aggregatesTab"

const HomePage = () => {
  const [password, setPassword] = useLocalStorage<string>("password", "")
  const [candidatePassword, setCandidatePassword] = useState<string>("")
  const [connectionError, setConnectionError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [records, setRecords] = useState<Record[]>([])
  const [daysCount, setDaysCount] = useState<number>(7)
  const [candidateDaysCount, setCandidateDaysCount] = useState<string>("7")
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [filter, setFilter] = useQueryState("filter")
  const [tab, setTab] = useQueryState("tab")
  const [startDate, setStartDate] = useQueryState("startDate")
  const [endDate, setEndDate] = useQueryState("endDate")
  const [selectedAthletes, setSelectedAthletes] =
    useQueryState("selectedAthletes")
  const [recordsSortQueryState, setRecordsSortQueryState] =
    useQueryState("recordsSort")
  const [recordsSortModel, setRecordsSortModel] = React.useState<GridSortModel>(
    () => {
      const querySorts = recordsSortQueryState?.split("-")
      if (querySorts && querySorts.length > 0) {
        return [
          {
            field: querySorts[0],
            sort: querySorts[1] as "asc" | "desc",
          },
        ]
      } else {
        return [
          {
            field: "date",
            sort: "desc",
          },
        ]
      }
    }
  )
  const [aggregatesSortQueryState, setAggregatesSortQueryState] =
    useQueryState("aggregatesSort")
  const [aggregatesSortModel, setAggregatesSortModel] =
    React.useState<GridSortModel>(() => {
      const querySorts = aggregatesSortQueryState?.split("-")
      if (querySorts && querySorts.length > 0) {
        return [
          {
            field: querySorts[0],
            sort: querySorts[1] as "asc" | "desc",
          },
        ]
      } else {
        return [
          {
            field: "count",
            sort: "desc",
          },
        ]
      }
    })
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  })

  const getRecords = useCallback(async () => {
    setLoading(true)
    if (password === "") {
      setLoading(false)
      return
    }

    let downloadedRecords = null
    try {
      downloadedRecords = await downloadJsonData(password)
    } catch (e: any) {
      setConnectionError(e.message)
    }

    if (downloadedRecords === null) {
      setLoading(false)
      return
    }

    const parsedRecords = downloadedRecords.map(
      (record: object) => new Record(record as RecordData)
    )
    setRecords(parsedRecords)
    setLoading(false)
  }, [password, setRecords])

  const getUniqueNames = useCallback(
    (excludeSelectedAthletes: boolean = false) => {
      const names: string[] = []
      const selectedNames = selectedAthletes?.split(",") ?? []
      records.forEach((record) => {
        if (
          !names.includes(record.name) &&
          (!excludeSelectedAthletes || !selectedNames.includes(record.name))
        ) {
          names.push(record.name)
        }
      })
      return names.sort()
    },
    [records, selectedAthletes]
  )

  const getTotal = useCallback(
    (
      name: string,
      field: "count" | "distance" | "elapsedTime" | "totalElevationGain"
    ) => {
      let total: number = 0
      records.forEach((record) => {
        if (
          record.name == name &&
          (filter === "All" || record.type == filter) &&
          (!startDate || record.date >= new Date(startDate as string)) &&
          (!endDate ||
            record.date <=
              new Date(
                new Date(endDate as string).getTime() + 24 * 60 * 60 * 1000
              ))
        ) {
          total += field === "count" ? 1 : record[field]
        }
      })
      return total
    },
    [records, filter, startDate, endDate]
  )

  const getAggregates = useCallback(() => {
    const names = getUniqueNames()
    const aggregates: Aggregate[] = []
    const selectedNames = selectedAthletes?.split(",") ?? []
    names
      .filter(
        (name) =>
          selectedAthletes === "" ||
          selectedAthletes === null ||
          selectedNames?.includes(name)
      )
      .forEach((name) => {
        const count = getTotal(name, "count")
        const totalDistance = getTotal(name, "distance")
        const totalElapsedTime = getTotal(name, "elapsedTime")
        const totalElevationGain = getTotal(name, "totalElevationGain")
        if (totalDistance > 0 || totalElapsedTime > 0)
          aggregates.push({
            name: name,
            count: count,
            distance: totalDistance,
            elapsedTime: totalElapsedTime,
            totalElevationGain: totalElevationGain,
          })
      })
    return aggregates
  }, [selectedAthletes, getTotal, getUniqueNames])

  // Get records on password change
  useEffect(() => {
    getRecords()
  }, [getRecords])

  // Get aggregates on records change
  useEffect(() => {
    setAggregates(getAggregates())
  }, [records, getAggregates])

  // Delay rerender to ensure MUI tabs are rendered correctly
  const setTabToDefault = useCallback(async () => {
    setTimeout(() => {
      setTab("activities")
    }, 100)
  }, [setTab])

  // Default to activities tab
  useEffect(() => {
    if (!tab || (tab !== "activities" && tab !== "leaderBoards"))
      setTabToDefault()
  }, [tab, setTab, setTabToDefault])

  // Default to all activities type
  useEffect(() => {
    if (filter === "" || filter == null) setFilter("All")
  }, [filter, setFilter])

  const areAllAthletesSelected = useCallback(() => {
    return (
      (selectedAthletes?.split(",") ?? []).length === getUniqueNames().length
    )
  }, [selectedAthletes, getUniqueNames])

  // Update records sort model query state
  useEffect(() => {
    if (recordsSortModel.length === 0) {
      setRecordsSortQueryState(null)
    } else {
      setRecordsSortQueryState(
        `${recordsSortModel[0].field}-${recordsSortModel[0].sort}`
      )
    }
  }, [recordsSortModel, setRecordsSortQueryState])

  // Update aggregates sort model query state
  useEffect(() => {
    if (aggregatesSortModel.length === 0) {
      setAggregatesSortQueryState(null)
    } else {
      setAggregatesSortQueryState(
        `${aggregatesSortModel[0].field}-${aggregatesSortModel[0].sort}`
      )
    }
  }, [aggregatesSortModel, setAggregatesSortQueryState])

  // Reset pagination page when tab changes
  useEffect(() => {
    // Delay rerender to ensure MUI Data Grid is rendered with correct pagination
    setTimeout(() => {
      setPaginationModel((currentModel) => ({
        ...currentModel,
        page: 0,
      }))
    }, 100)
  }, [tab, setPaginationModel])

  const recordRows = records.map((record, index) => {
    return {
      id: index,
      name: record.name,
      date: formatDate(record.date),
      type: record.type,
      distance: Math.round(record.distance / 10) / 100,
      elapsedTime: record.elapsedTime / 60,
      totalElevationGain: record.totalElevationGain,
      description: record.description,
      pace: getPace(record.elapsedTime, record.distance),
    }
  })

  const recordColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 130,
      headerClassName: "grid_header",
      type: "string",
    },
    { field: "date", headerName: "Date", width: 130, type: "string" },
    { field: "type", headerName: "Type", width: 150, type: "string" },
    {
      field: "distance",
      headerName: "Distance (km)",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? <>{params.value}</> : "-",
    },
    {
      field: "elapsedTime",
      headerName: "Elapsed time",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? (
          <>{formatMinutesToTime(params.value as number)}</>
        ) : (
          <>-</>
        ),
    },
    {
      field: "totalElevationGain",
      headerName: "Elevation (m)",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? <>{params.value}</> : <>-</>,
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      type: "string",
    },
    {
      field: "pace",
      headerName: "Pace",
      width: 130,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? (
          <>{formatMinutesToTime(params.value as number)}</>
        ) : (
          <>-</>
        ),
    },
  ]

  const aggregateRows = aggregates.map((aggregate, index) => {
    return {
      id: index,
      name: aggregate.name,
      count: aggregate.count,
      distance: Math.round(aggregate.distance / 10) / 100,
      elapsedTime: aggregate.elapsedTime / 60,
      totalElevationGain: Math.round(aggregate.totalElevationGain),
      pace: getPace(aggregate.elapsedTime, aggregate.distance),
    }
  })

  const aggregateColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 130,
      headerClassName: "grid_header",
      type: "string",
    },
    {
      field: "count",
      headerName: "Count",
      width: 100,
      type: "number",
    },
    {
      field: "distance",
      headerName: "Distance (km)",
      width: 140,
      type: "number",
    },
    {
      field: "elapsedTime",
      headerName: "Elapsed time",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? (
          <>{formatMinutesToTime(params.value as number)}</>
        ) : (
          <>-</>
        ),
    },
    {
      field: "totalElevationGain",
      headerName: "Elevation (m)",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? <>{params.value}</> : <>-</>,
    },
    {
      field: "pace",
      headerName: "Pace",
      width: 140,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? (
          <>{formatMinutesToTime(params.value as number)}</>
        ) : (
          <>-</>
        ),
    },
  ]

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as ActivityType)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue.toString())
  }

  const handleSelectAllAthletes = () => {
    setSelectedAthletes(getUniqueNames().join(","))
  }

  const handleUnselectAllAthletes = () => {
    setSelectedAthletes("")
  }

  const handlePasswordSubmission = (event: any) => {
    event.preventDefault()
    if (candidatePassword === password) {
      getRecords()
      return
    }
    setPassword(candidatePassword)
  }

  const clearData = () => {
    setPassword("")
    setCandidatePassword("")
    setRecords([])
    setAggregates([])
    setConnectionError("")
  }

  if (loading === true || tab === null)
    return (
      <main className="flex flex-col h-screen w-screen justify-center items-center bg-slate-900 text-emerald-400">
        <p>Loading</p>
        <div>
          <CircularProgress color="inherit" />
        </div>
      </main>
    )

  if (records.length === 0)
    return (
      <main className="flex h-screen w-screen justify-center items-center p-4 box-border bg-slate-900">
        <form className="flex-1 max-w-[400px] flex flex-col gap-4 p-8 bg-white shadow rounded">
          <h1 className="m-0 text-xl text-emerald-600 font-semibold">
            AutoRek StrARva Club
          </h1>
          <p className="m-0 mb-2">
            A valid password is required to access this app
          </p>
          <TextField
            id="name"
            label="Password"
            type="password"
            value={candidatePassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCandidatePassword(event.target.value)
            }}
            fullWidth
            error={connectionError !== ""}
            helperText={connectionError}
          />
          <div className="flex justify-end">
            <Button
              size="small"
              onClick={handlePasswordSubmission}
              type="submit"
            >
              Connect
            </Button>
          </div>
        </form>
      </main>
    )

  return (
    <main className="flex flex-col items-center p-5 gap-2 min-h-screen box-border">
      <h1
        className="text-2xl font-normal text-center m-0 mb-2 leading-none"
        style={{ color: "#00ffaf" }}
      >
        AutoRek StrARva Club
      </h1>
      <div
        className="flex-1 w-full flex flex-col box-border bg-white shadow rounded"
        style={{ maxWidth: tab === "leaderBoards" ? 950 : 1290 }}
      >
        <nav className="px-4 box-border text-slate-300 bg-slate-200 w-full rounded-t shadow border-0 border-b border-solid border-slate-300">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-y-2">
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="basic tabs example"
              sx={{ color: "black" }}
            >
              <Tab label="Activities" value="activities" />
              <Tab label="Leader Boards" value="leaderBoards" />
            </Tabs>
          </div>
        </nav>
        {tab !== "leaderBoards" && (
          <RecordsTab
            records={records}
            recordRows={recordRows}
            recordColumns={recordColumns}
            recordsSortModel={recordsSortModel}
            setRecordsSortModel={setRecordsSortModel}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            daysCount={daysCount}
            setDaysCount={setDaysCount}
            candidateDaysCount={candidateDaysCount}
            setCandidateDaysCount={setCandidateDaysCount}
          />
        )}
        {tab === "leaderBoards" && (
          <AggregatesTab
            filter={filter as ActivityType}
            handleFilterChange={handleFilterChange}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedAthletes={selectedAthletes}
            setSelectedAthletes={setSelectedAthletes}
            handleSelectAllAthletes={handleSelectAllAthletes}
            handleUnselectAllAthletes={handleUnselectAllAthletes}
            areAllAthletesSelected={areAllAthletesSelected}
            getUniqueNames={getUniqueNames}
            aggregateRows={aggregateRows}
            aggregateColumns={aggregateColumns}
            aggregatesSortModel={aggregatesSortModel}
            setAggregatesSortModel={setAggregatesSortModel}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
          />
        )}
      </div>
      <div className="flex items-center">
        <Button
          onClick={clearData}
          sx={{
            color: "#4ade80",
          }}
        >
          Sign out
        </Button>
      </div>
    </main>
  )
}

export default HomePage
