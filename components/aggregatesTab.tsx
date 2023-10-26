import { DataGrid } from "@mui/x-data-grid"
import { parseDate } from "@/functions/formatDate"
import {
  Button,
  Checkbox,
  Chip,
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
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import GroupAddIcon from "@mui/icons-material/GroupAdd"
import GroupRemoveIcon from "@mui/icons-material/GroupRemove"
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike"
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import ActivityType from "@/types/ActivityType"
import getAggregateColumnVisibilityModel from "@/functions/getColumnVisibilityModel"
import React, { useEffect, useState } from "react"

interface AggregatesTabProps {
  filter: ActivityType | null
  handleFilterChange: (event: SelectChangeEvent) => void
  startDate: string | null
  setStartDate: (value: string | null) => void
  endDate: string | null
  setEndDate: (value: string | null) => void
  selectedAthletes: string | null
  setSelectedAthletes: (value: string | ((old: string | null) => string | null) | null) => void
  handleSelectAllAthletes: () => void
  handleUnselectAllAthletes: () => void
  areAllAthletesSelected: () => boolean
  getUniqueNames: (includeSelected?: boolean) => string[]
  aggregateRows: any[]
  aggregateColumns: any[]
  aggregatesSortModel: any[]
  setAggregatesSortModel: (value: any[]) => void
  paginationModel: any
  setPaginationModel: (value: any) => void
}

const AggregatesTab = ({
  filter,
  handleFilterChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedAthletes,
  setSelectedAthletes,
  handleSelectAllAthletes,
  handleUnselectAllAthletes,
  areAllAthletesSelected,
  getUniqueNames,
  aggregateRows,
  aggregateColumns,
  aggregatesSortModel,
  setAggregatesSortModel,
  paginationModel,
  setPaginationModel,
}: AggregatesTabProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogSelectedAthletes, setDialogSelectedAthletes] = useState<
    string[]
  >([])
  const [dateError, setDateError] = useState<string | null>(null)

  // Close dialog box if all athletes are selected
  useEffect(() => {
    if (areAllAthletesSelected()) {
      setDialogOpen(false)
    }
  }, [selectedAthletes, areAllAthletesSelected])

  // Check start date is not after end date
  useEffect(() => {
    if (startDate && endDate && parseDate(startDate) > parseDate(endDate)) {
      setDateError("Start date cannot be after end date")
    } else {
      setDateError(null)
    }
  }, [startDate, endDate])

  const handleSelectAthletes = () => {
    setSelectedAthletes((currentValue) => {
      let names: string[] = currentValue ? currentValue.split(",") : []
      dialogSelectedAthletes.forEach((name) => {
        if (!names.includes(name)) {
          names.push(name)
        }
      })
      return names.join(",")
    })
    closeAndResetDialog()
  }

  const handleUnselectAthlete = (name: string) => {
    setSelectedAthletes((currentValue) => {
      const currentNames = currentValue ? currentValue.split(",") : []
      return currentNames
        .filter((athlete: string) => athlete !== name)
        .join(",")
    })
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

  const closeAndResetDialog = () => {
    setDialogOpen(false)
    setDialogSelectedAthletes([])
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

  return (
    <div className="h-full flex flex-col p-4 mt-2 gap-2 box-border">
      <div className="flex justify-center gap-4 flex-col items-center lg:justify-start lg:flex-row">
        <div className="w-full max-w-[259px]">
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
                  setStartDate(newValue ? newValue.format("YYYY-MM-DD") : null)
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
                  setEndDate(newValue ? newValue.format("YYYY-MM-DD") : null)
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
            <p className="m-0 text-slate-700 text-center">Selected Athletes</p>
          </div>
          <div className="flex-1 flex flex-row gap-3 flex-wrap justify-center">
            {selectedAthletes
              .split(",")
              .map((name, index) => renderSelectedAthleteChit(name, index))}
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
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            "& .MuiDataGrid-virtualScroller": {
              minHeight: "50px",
            },
          }}
          columnVisibilityModel={getAggregateColumnVisibilityModel(
            filter as ActivityType
          )}
          sortModel={aggregatesSortModel}
          onSortModelChange={(newSortModel) =>
            setAggregatesSortModel(newSortModel)
          }
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </div>
    </div>
  )
}

export default AggregatesTab
