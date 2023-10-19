interface RecordData {
  name: string
}

class Record {
  name: string

  constructor(data: RecordData) {
    this.name = data.name
  }
}

export default Record
