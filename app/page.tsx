"use client"

import { useCallback, useEffect, useState } from "react"
import Record, { RecordData } from "@/classes/record"
import downloadRecords from "@/functions/downloadRecords"
import { DataGrid } from "@mui/x-data-grid"
import { formatDate } from "@/functions/formatDate"
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  FormControl,
  IconButton,
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
import dayjs from "dayjs"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import GroupAddIcon from "@mui/icons-material/GroupAdd"
import GroupRemoveIcon from "@mui/icons-material/GroupRemove"

type ActivityType = "Run" | "Walk" | "Ride"

const HomePage = () => {
  const [records, setRecords] = useState<Record[]>([])
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [filter, setFilter] = useQueryState("filter")
  const [tab, setTab] = useQueryState("tab")
  const [startDate, setStartDate] = useQueryState("startDate")
  const [endDate, setEndDate] = useQueryState("endDate")
  const [error, setError] = useState<string | null>(null)
  const [selectedAthletes, setSelectedAthletes] =
    useQueryState("selectedAthletes")
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const getRecords = useCallback(async () => {
    const downloadedRecords = await downloadRecords()

    const parsedRecords = downloadedRecords.map(
      (record: object) => new Record(record as RecordData)
    )
    setRecords(parsedRecords)
  }, [])

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
      field: "distance" | "elapsedTime" | "totalElevationGain"
    ) => {
      let totalDistance: number = 0
      records.forEach((record) => {
        if (
          record.name == name &&
          record.type == filter &&
          (!startDate || record.date >= new Date(startDate as string)) &&
          (!endDate ||
            record.date <=
              new Date(
                new Date(endDate as string).getTime() + 24 * 60 * 60 * 1000
              ))
        ) {
          totalDistance += record[field]
        }
      })
      return totalDistance
    },
    [records, filter, startDate, endDate]
  )

  const getAggregates = useCallback(() => {
    const names = getUniqueNames()
    const aggregates: Aggregate[] = []
    const selectedNames = selectedAthletes?.split(",") ?? []
    names
      .filter(
        (name) => selectedAthletes === "" || selectedAthletes === null || selectedNames?.includes(name)
      )
      .forEach((name) => {
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
  }, [selectedAthletes, getTotal, getUniqueNames])

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
  }, [tab, setTab, setTabToDefault])

  useEffect(() => {
    // Check start date is not after end date
    if (startDate && endDate && dayjs(startDate) > dayjs(endDate)) {
      setError("Start date cannot be after end date")
    } else {
      setError(null)
    }
  }, [startDate, endDate])

  const areAllAthletesSelected = useCallback(() => {
    return (
      (selectedAthletes?.split(",") ?? []).length === getUniqueNames().length
    )
  }, [selectedAthletes, getUniqueNames])

  useEffect(() => {
    // Close dialog box if all athletes are selected
    if (areAllAthletesSelected()) {
      setDialogOpen(false)
    }
  }, [selectedAthletes, areAllAthletesSelected])

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

  const handleUnselectAthlete = (name: string) => {
    setSelectedAthletes((currentValue) => {
      const currentNames = currentValue ? currentValue.split(",") : []
      return currentNames.filter((athlete) => athlete !== name).join(",")
    })
  }

  const handleSelectAthlete = (name: string) => {
    setSelectedAthletes((currentValue) => {
      const currentNames = currentValue ? currentValue.split(",") : []
      return !currentNames.includes(name)
        ? [...currentNames, name].join(",")
        : currentValue
    })
    setDialogOpen(false)
  }

  const handleSelectAllAthletes = () => {
    setSelectedAthletes(getUniqueNames().join(","))
  }

  const handleUnselectAllAthletes = () => {
    setSelectedAthletes("")
  }

  const renderSelectedAthleteChit = (name: string, index: number) => (
    <Chip
      key={index}
      label={name}
      onDelete={() => handleUnselectAthlete(name)}
      className="bg-slate-500 text-white"
      sx={{
        "& .MuiChip-deleteIcon": {
          color: "#94a3b8",
          "&:hover": {
            color: "#cbd5e1",
          },
        },
      }}
    />
  )

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
    <main className="flex flex-col items-center p-5 min-h-screen box-border bg-slate-700">
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
                pagination: {
                  paginationModel: { pageSize: 20 },
                },
              }}
              sx={{
                "& .MuiDataGrid-virtualScroller": {
                  minHeight: "50px",
                },
              }}
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
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="max-w-[259px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      value={startDate ? dayjs(startDate) : null}
                      onChange={(newValue) =>
                        setStartDate(newValue?.toString() ?? null)
                      }
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
                      value={endDate ? dayjs(endDate) : null}
                      onChange={(newValue) =>
                        setEndDate(newValue?.toString() ?? null)
                      }
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
              {!selectedAthletes && (
                <div>
                  <IconButton
                    onClick={() => setDialogOpen(true)}
                    aria-label="filter athletes"
                  >
                    <PersonAddIcon></PersonAddIcon>
                  </IconButton>
                  <IconButton
                    aria-label="select all athletes"
                    onClick={handleSelectAllAthletes}
                    disabled={areAllAthletesSelected()}
                  >
                    <GroupAddIcon fontSize="inherit" />
                  </IconButton>
                </div>
              )}
            </div>
            {error && (
              <div className="self-center">
                <p className="text-red-500 m-0">{error}</p>
              </div>
            )}
            {selectedAthletes && (
              <div className="flex flex-col lg:flex-row p-3 mt-2 gap-x-3 gap-y-2 items-center bg-slate-300 rounded">
                <div className="self-center lg:self-start h-8 flex items-center">
                  <p className="m-0 text-slate-700">Selected Athletes</p>
                </div>
                <div className="flex-1 flex flex-row gap-3 flex-wrap justify-center">
                  {selectedAthletes
                    .split(",")
                    .map((name, index) =>
                      renderSelectedAthleteChit(name, index)
                    )}
                </div>
                <div className="self-center lg:self-start h-8 flex items-center">
                  <IconButton
                    aria-label="select athlete"
                    onClick={() => setDialogOpen(true)}
                    disabled={areAllAthletesSelected()}
                  >
                    <PersonAddIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    aria-label="select all athletes"
                    onClick={handleSelectAllAthletes}
                    disabled={areAllAthletesSelected()}
                  >
                    <GroupAddIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    aria-label="unselect all athletes"
                    onClick={handleUnselectAllAthletes}
                  >
                    <GroupRemoveIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
            )}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              {getUniqueNames(true).map((name, index) => (
                <Button key={index} onClick={() => handleSelectAthlete(name)}>
                  {name}
                </Button>
              ))}
            </Dialog>
            <div className="flex-1 box-border mt-2">
              <DataGrid
                rows={aggregateRows}
                columns={aggregateColumns}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "distance", sort: "desc" }],
                  },
                  pagination: {
                    paginationModel: { pageSize: 20 },
                  },
                }}
                sx={{
                  "& .MuiDataGrid-virtualScroller": {
                    minHeight: "50px",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
