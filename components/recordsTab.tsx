import { DataGrid } from "@mui/x-data-grid"

interface RecordsTabProps {
  recordRows: any[]
  recordColumns: any[]
  recordsSortModel: any[]
  setRecordsSortModel: (newSortModel: any[]) => void
  paginationModel: any
  setPaginationModel: (newPaginationModel: any) => void
}

const RecordsTab = ({recordRows, recordColumns, recordsSortModel, setRecordsSortModel, paginationModel, setPaginationModel}: RecordsTabProps) => {
  return (
    <div className="h-full box-border p-4">
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