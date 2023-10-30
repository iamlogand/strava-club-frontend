import { Button, Menu, MenuItem } from "@mui/material"
import React from "react"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"

const MORUNNERS = process.env.NEXT_PUBLIC_MORUNNERS

interface ChallengeLink {
  title: string
  morunning: boolean
  sortField: string
}

interface GroupLinksProps {
  setSelectedAthletes: (value: string) => void
  setTab: (value: string) => void
  getUniqueNames: () => string[]
  setFilter: (value: string) => void
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  setAggregatesSortModel: (value: any[]) => void
}

const GroupLinks = ({
  setSelectedAthletes,
  setTab,
  getUniqueNames,
  setFilter,
  setStartDate,
  setEndDate,
  setAggregatesSortModel,
}: GroupLinksProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const links: ChallengeLink[] = [
    {
      title: "Morunners: run count",
      morunning: true,
      sortField: "count",
    },
    {
      title: "Morunners: running distance",
      morunning: true,
      sortField: "distance",
    },
    {
      title: "Morunners: running time",
      morunning: true,
      sortField: "elapsedTime",
    },
    {
      title: "Others: activity count",
      morunning: false,
      sortField: "count",
    },
    {
      title: "Others: activities distance",
      morunning: false,
      sortField: "distance",
    },
    {
      title: "Others: activities time",
      morunning: false,
      sortField: "elapsedTime",
    },
  ]

  const handleItemClick = (morunning: boolean, sortField: string) => {
    if (!MORUNNERS) return
    const morunners = MORUNNERS.replace(/_/g, " ")

    if (morunning) {
      setSelectedAthletes(morunners)
      setFilter("Run")
    } else {
      const uniqueNames = getUniqueNames()
      const morunnersArray = morunners.split(",")
      const nonMorunners = uniqueNames.filter(
        (name) => !morunnersArray.includes(name)
      )
      setSelectedAthletes(nonMorunners.sort().join(","))
      setFilter("All")
    }
    setStartDate("2023-10-30")
    setEndDate("2023-11-19")
    setAggregatesSortModel([
      {
        field: sortField,
        sort: "desc",
      },
    ])
    setTab("leaderBoards")
    setAnchorEl(null)
  }

  const renderLink = (link: ChallengeLink, key: number) => (
    <MenuItem
      key={key}
      onClick={() => handleItemClick(link.morunning, link.sortField)}
    >
      {link.title}
    </MenuItem>
  )

  return (
    <div className="flex items-center">
      <Button
        id="challenges-button"
        aria-controls={open ? "challenges-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleButtonClick}
      >
        Challenges <ArrowDropDownIcon />
      </Button>
      <Menu
        id="challenges-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "challenges-button",
        }}
      >
        {links.map((link, index) => renderLink(link, index))}
      </Menu>
    </div>
  )
}

export default GroupLinks
