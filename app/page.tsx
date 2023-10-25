"use client"

import { useCallback, useEffect, useState } from "react"
import Record, { RecordData } from "@/classes/record"
import downloadRecords from "@/functions/downloadRecords"
import { DataGrid, GridCellParams } from "@mui/x-data-grid"
import formatDate, { parseDate } from "@/functions/formatDate"
import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
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
import useLocalStorage from "@/functions/useLocalStorage"
import getPace from "@/functions/getPace"
import formatMinutesToTime from "@/functions/formatTime"
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike"
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import ActivityType from "@/types/ActivityType"
import getAggregateColumnVisibilityModel from "@/functions/getColumnVisibilityModel"

const HomePage = () => {
  const [password, setPassword] = useLocalStorage<string>("password", "")
  const [candidatePassword, setCandidatePassword] = useState<string>("")
  const [connectionError, setConnectionError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [records, setRecords] = useState<Record[]>([])
  const [aggregates, setAggregates] = useState<Aggregate[]>([])
  const [filter, setFilter] = useQueryState("filter")
  const [tab, setTab] = useQueryState("tab")
  const [startDate, setStartDate] = useQueryState("startDate")
  const [endDate, setEndDate] = useQueryState("endDate")
  const [dateError, setDateError] = useState<string | null>(null)
  const [selectedAthletes, setSelectedAthletes] =
    useQueryState("selectedAthletes")
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogSelectedAthletes, setDialogSelectedAthletes] = useState<
    string[]
  >([])

  const getRecords = useCallback(async () => {
    setLoading(true)
    if (password === "") {
      setLoading(false)
      return
    }

    let downloadedRecords = null
    try {
      downloadedRecords = await downloadRecords(password)
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
    // Default to all activities type
    if (filter === "" || filter == null) setFilter("All")
  }, [filter, setFilter])

  useEffect(() => {
    // Check start date is not after end date
    if (startDate && endDate && parseDate(startDate) > parseDate(endDate)) {
      setDateError("Start date cannot be after end date")
    } else {
      setDateError(null)
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
      width: 130,
      type: "number",
      renderCell: (params: GridCellParams) =>
        params.value ? <>{params.value}</> : "-",
    },
    {
      field: "elapsedTime",
      headerName: "Elapsed time",
      width: 130,
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
      width: 130,
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

  const handleUnselectAthlete = (name: string) => {
    setSelectedAthletes((currentValue) => {
      const currentNames = currentValue ? currentValue.split(",") : []
      return currentNames.filter((athlete) => athlete !== name).join(",")
    })
  }

  const handleSelectAllAthletes = () => {
    setSelectedAthletes(getUniqueNames().join(","))
  }

  const handleUnselectAllAthletes = () => {
    setSelectedAthletes("")
  }

  const handleSelectAthletes = () => {
    setSelectedAthletes((currentValue) => {
      let names = currentValue ? currentValue.split(",") : []
      dialogSelectedAthletes.forEach((name) => {
        if (!names.includes(name)) {
          names.push(name)
        }
      })
      return names.join(",")
    })
    closeAndResetDialog()
  }

  const closeAndResetDialog = () => {
    setDialogOpen(false)
    setDialogSelectedAthletes([])
  }

  const handleDialogSelectAthlete = (name: string) => {
    setDialogSelectedAthletes((currentNames) =>
      !currentNames.includes(name) ? [...currentNames, name] : currentNames
    )
  }

  const handleDialogUnselectAthlete = (name: string) => {
    setDialogSelectedAthletes((currentNames) =>
      currentNames.filter((currentName) => currentName != name)
    )
  }

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    event.target.checked
      ? handleDialogSelectAthlete(name)
      : handleDialogUnselectAthlete(name)
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

  const renderSelectedAthleteChit = (name: string, index: number) => (
    <Chip
      key={index}
      label={name}
      onDelete={() => handleUnselectAthlete(name)}
      sx={{
        color: "white",
        backgroundColor: "#059669",
        "& .MuiChip-deleteIcon": {
          color: "#34d399",
          "&:hover": {
            color: "#a7f3d0",
          },
        },
      }}
      className="shadow"
    />
  )

  const renderSelectAthleteCheckbox = (name: string, index: number) => (
    <FormControlLabel
      key={index}
      control={
        <Checkbox
          checked={dialogSelectedAthletes.includes(name)}
          onChange={(event) => handleCheckboxChange(event, name)}
        />
      }
      label={name}
    />
  )

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
          <h1 className="m-0 text-xl text-emerald-600">AutoRek Strava Club</h1>
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
      <h1 className="text-2xl font-bold text-center m-0 mb-2 leading-none text-emerald-300">
        AutoRek Strava Club
      </h1>
      <div
        className="flex-1 w-full flex flex-col box-border bg-white shadow rounded"
        style={{ maxWidth: tab === "leaderBoards" ? 960 : 1250 }}
      >
        <nav className="px-4 box-border text-slate-300 bg-slate-200 w-full rounded-t shadow border-0 border-b border-solid border-slate-300">
          <div className="flex gap-6 flex justify-center">
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
          <div className="h-full box-border p-4">
            <DataGrid
              rows={recordRows}
              columns={recordColumns}
              initialState={{
                sorting: {
                  sortModel: [{ field: "date", sort: "desc" }],
                },
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{
                "& .MuiDataGrid-virtualScroller": {
                  minHeight: "50px",
                },
              }}
            />
          </div>
        )}
        {tab === "leaderBoards" && (
          <div className="h-full flex flex-col p-4 mt-2 gap-2 box-border items-center">
            <div className="flex justify-center gap-4 flex-col items-center lg:flex-row">
              <div className="max-w-[259px]">
                <FormControl fullWidth>
                  <InputLabel id="select-label">Activity Type</InputLabel>
                  <Select
                    labelId="select-label"
                    value={(filter as ActivityType) ?? ""}
                    label="Activity Type"
                    onChange={handleFilterChange}
                    sx={{ "& .MuiSelect-select": { display: "flex" } }}
                  >
                    <MenuItem value={"All"}>
                      <AllInclusiveIcon className="mr-3" />
                      All
                    </MenuItem>
                    <MenuItem value={"Run"}>
                      <DirectionsRunIcon className="mr-3" />
                      Run
                    </MenuItem>
                    <MenuItem value={"Walk"}>
                      <DirectionsWalkIcon className="mr-3" />
                      Walk
                    </MenuItem>
                    <MenuItem value={"Ride"}>
                      <DirectionsBikeIcon className="mr-3" />
                      Ride
                    </MenuItem>
                    <MenuItem value={"Virtual Ride"}>
                      <DirectionsBikeIcon className="mr-3" />
                      Virtual Ride
                    </MenuItem>
                    <MenuItem value={"Mountain Bike Ride"}>
                      <DirectionsBikeIcon className="mr-3" />
                      Mountain Bike Ride
                    </MenuItem>
                    <MenuItem value={"Weight Training"}>
                      <FitnessCenterIcon className="mr-3" />
                      Weight Training
                    </MenuItem>
                    <MenuItem value={"Football"}>
                      <SportsSoccerIcon className="mr-3" />
                      Football
                    </MenuItem>
                    <MenuItem value={"Yoga"}>
                      <SelfImprovementIcon className="mr-3" />
                      Yoga
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="max-w-[259px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      value={startDate ? dayjs(parseDate(startDate)) : null}
                      onChange={(newValue) =>
                        setStartDate(
                          newValue ? newValue.format("YYYY-MM-DD") : null
                        )
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
                      value={endDate ? dayjs(parseDate(endDate)) : null}
                      onChange={(newValue) =>
                        setEndDate(
                          newValue ? newValue.format("YYYY-MM-DD") : null
                        )
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
            {dateError && (
              <div className="self-center">
                <p className="text-red-500 m-0">{dateError}</p>
              </div>
            )}
            {selectedAthletes && (
              <div className="flex flex-col lg:flex-row p-3 mt-2 gap-3 items-center bg-slate-100 border border-solid border-slate-200 shadow-inner rounded">
                <div className="self-center lg:self-start h-8 flex items-center">
                  <p className="m-0 text-slate-700 text-center">
                    Selected Athletes
                  </p>
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
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              maxWidth="lg"
            >
              <DialogTitle>Select athletes</DialogTitle>
              <div className="mx-6 mb-2 text-slate-500">
                Selecting {dialogSelectedAthletes.length} new athletes
              </div>
              <DialogContent className="mx-6 px-8 border-solid border border-slate-200 rounded shadow-inner">
                <div className="sm:w-[300px] md:w-[450px] lg:w-[600px] xl:w-[750px] grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
                  {getUniqueNames(true).map((name, index) =>
                    renderSelectAthleteCheckbox(name, index)
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeAndResetDialog}>Cancel</Button>
                <Button onClick={handleSelectAthletes} variant="contained">
                  Select
                </Button>
              </DialogActions>
            </Dialog>
            <div className="w-full flex-1 box-border mt-2">
              <DataGrid
                rows={aggregateRows}
                columns={aggregateColumns}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "count", sort: "desc" }],
                  },
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                sx={{
                  "& .MuiDataGrid-virtualScroller": {
                    minHeight: "50px",
                  },
                }}
                columnVisibilityModel={getAggregateColumnVisibilityModel(
                  filter as ActivityType
                )}
              />
            </div>
          </div>
        )}
      </div>
      <div>
        <Button
          size="small"
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
