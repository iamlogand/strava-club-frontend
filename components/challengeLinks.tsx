import { Link } from "@mui/material"

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

  const handleClick = (morunning: boolean, sortField: string) => {
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
      setSelectedAthletes(nonMorunners.sort().join(", "))
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
  }

  const renderLink = (link: ChallengeLink, key: number) => (
    <Link
      onClick={() => handleClick(link.morunning, link.sortField)}
      sx={{
        color: "#4ade80",
      }}
      key={key}
    >
      {link.title}
    </Link>
  )

  return (
    <div className="flex flex-col gap-1 items-center max-w-[600px]">
      <span className="text-white">Challenge Leader Boards:</span>
      <div className="flex gap-x-4 gap-y-1 flex-wrap justify-center">
        {links.map((link, index) => renderLink(link, index))}
      </div>
    </div>
  )
}

export default GroupLinks
