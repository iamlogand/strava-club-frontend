import formatDate from "@/functions/formatDate"
import { BarChart } from "@mui/x-charts"
import { DataGrid } from "@mui/x-data-grid"
import Record from "@/classes/record"
import { useEffect } from "react"
import { TextField } from "@mui/material"
import addOrdinalSuffix from "@/functions/formatNumber"

interface RecordsTabProps {
  records: Record[]
  recordRows: any[]
  recordColumns: any[]
  recordsSortModel: any[]
  setRecordsSortModel: (newSortModel: any[]) => void
  paginationModel: any
  setPaginationModel: (newPaginationModel: any) => void
  daysCount: number
  setDaysCount: (newDaysCount: number) => void
  candidateDaysCount: string
  setCandidateDaysCount: (newCandidateDaysCount: string) => void
}

const RecordsTab = ({
  records,
  recordRows,
  recordColumns,
  recordsSortModel,
  setRecordsSortModel,
  paginationModel,
  setPaginationModel,
  daysCount,
  setDaysCount,
  candidateDaysCount,
  setCandidateDaysCount
}: RecordsTabProps) => {

  const getChartLabels = () => {
    const today = new Date()
    const labels = []
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (let i = 0; i < daysCount - 1; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i - 1)
      const label = `${daysOfWeek[date.getDay()]}, ${addOrdinalSuffix(
        date.getDate()
      )}`
      labels.push(label)
    }
    labels.reverse()
    labels.push("Today")
    return labels
  }

  const getChartData = () => {
    const today = new Date()
    const recordCounts = []
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const count = records.filter((record) => {
        return formatDate(record.date) === formatDate(date)
      }).length
      recordCounts.push(count)
    }
    recordCounts.reverse()
    return recordCounts
  }

  const parseDaysCount = (text: string) => {
    const parsed = parseInt(text)
    if (isNaN(parsed)) {
      return 1
    }
    if (parsed < 1) return 1
    if (parsed > 28) return 28
    return parsed
  }

  const getChartMaxWidth = () => {
    if (daysCount <= 7) return 600
    else return 600 + (daysCount - 7) * 70
  }

  useEffect(() => {
    setDaysCount(parseDaysCount(candidateDaysCount))
  }, [candidateDaysCount, setDaysCount])

  return (
    <div className="h-full box-border p-4 flex flex-col gap-4">
      <div className="w-full p-4 flex flex-col items-center border border-solid bg-slate-100 border-slate-200 shadow-inner rounded">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span className="text-center">
            Graph showing activites synced to Strava in the last
          </span>
          <div className="flex items-center gap-2">
            <TextField
              size="small"
              value={candidateDaysCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setCandidateDaysCount(
                  parseInt(event.target.value) > 28 ? "28" : event.target.value
                )
              }}
              sx={{
                width: "40px",
                backgroundColor: "white",
                borderRadius: "4px",
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontSize: "1.2rem",
                  padding: "4px",
                },
              }}
            />{" "}
            days
          </div>
        </div>
        <div
          className="h-[270px] sm:h-[400px] w-full"
          style={{ maxWidth: getChartMaxWidth() }}
        >
          <BarChart
            xAxis={[
              {
                id: "barCategories",
                data: getChartLabels(),
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: getChartData(),
                label: "Activities synced",
                color: "#00ffaf",
              },
            ]}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
          />
        </div>
      </div>
      <DataGrid
        rows={recordRows}
        columns={recordColumns}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          "& .MuiDataGrid-virtualScroller": {
            minHeight: "50px",
          },
        }}
        sortModel={recordsSortModel}
        onSortModelChange={(newSortModel) => setRecordsSortModel(newSortModel)}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </div>
  )
}

export default RecordsTab
