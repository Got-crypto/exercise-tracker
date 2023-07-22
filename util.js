const returnLogs = (logs) => {
    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    const datesFrom = from ? logs?.filter((log) => new Date(log.date) >= dateFrom) : []
    const datesTo = to ? logs?.filter((log) => new Date(log.date) <= dateTo) : []

    let allDates = [...datesFrom, ...datesTo]

    const removedDatesDuplicates = []

    for(let obj in allDates) {
      if(removedDatesDuplicates.length === 0) {
        removedDatesDuplicates.push(allDates[obj])
        continue
      }
      if(new Date(removedDatesDuplicates[parseInt(obj-1)]?.date) !== new Date(allDates[obj]?.date)) {

        removedDatesDuplicates.push(allDates[obj])
        continue
      }
    }

    // console.log('removedDuplicates', removedDatesDuplicates)

    const betterFilter = allDates.filter((log, i) => {
      if(datesTo.length > 0 && datesFrom.length > 0) {
        return new Date(log.date) >= dateFrom && new Date(log.date) <= dateTo
      }  else if (datesTo.length === 0 && datesFrom.length > 0){
        return new Date(log.date) >= dateFrom
      } else if (datesTo.length > 0 && datesFrom.length === 0) {
        return new Date(log.date) <= dateTo
      }
    })

    // console.log('betterFilter', betterFilter)

    const filteredLogs = from || to ? logs.filter((log, index) => datesFrom[index]?.date === log.date || datesTo[index]?.date === log.date) : logs

    const limitedLogs = () => {
      let logs = []
      for(let log in filteredLogs) {
        if(parseInt(log) + 1 <= parseInt(limit)) {
          logs.push(filteredLogs[log])
        } else {
          break
        }
      }

      return logs
    }

    return limit ? limitedLogs() : filteredLogs
  }