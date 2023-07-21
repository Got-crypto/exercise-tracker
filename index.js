const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: !1}))

const DB_URL = process.env.DATABASE_URL

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(DB_URL, options)

const {Schema, model} = mongoose

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})

const userSchema = new Schema({
  username: String
})

const LogSchema = new Schema({
  description: String,
  duration: Number,
  date: String
}) 

const logSchema = new Schema({
  username: String,
  count: Number,
  log: [LogSchema]
})

const Exercise = model('Exercise', exerciseSchema)
const User = model('User', userSchema)
const Log = model('Log', logSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const createLogs = async (data) => {
  const exercises = await Exercise.find({username: data?.username}).select({_id: 0}).exec()

  console.log('exercises', exercises)

  const log = {
    username: data?.username,
    count: exercises?.length,
    log: exercises
  }

  const userLogExist = !!Object.keys(await Log.find({username: data?.username}) || []).length
  
  if(userLogExist) {
    return await Log.findOneAndUpdate({username: data?.username}, log)
  }

  return Log.create(log)
}

const usersPost = async (req, res) => {
  const username = req.body
  const user = await User.findOne(username)
  const usernameExist = !!Object.keys(await User.find(username) || {}).length

  if(usernameExist) {
    return res.json({username: user?.username, _id: user?._id?.toString()})
  }

  const doc = await User.create(username)

  return res.json({username: doc?.username, _id: doc?._id?.toString()})
}

const usersGet = async (req, res) => {
  const users = await User.find().select({username: 1, _id: 1}).exec()

  return res.json(users)
}

app.route('/api/users').post(usersPost).get(usersGet)

app.post('/api/users/:id/exercises', async (req, res) => {
  const {description, duration, date} = req.body
  const id = req.params.id

  if(id === "") {
    return res.json({error: "id required"})
  }

  if(description === "" || duration === "") {
    return res.json({error: "description and duration are required"})
  }
  
  const user = await User.findById(id)

  if (date === "") {
    const newDate = new Date().toDateString()

    const formData = {id, description, duration: parseInt(duration), newDate, username: user?.username}

    await Exercise.create({...formData, id: null})
    await createLogs(formData)
    
    return res.json({user: formData})
  }
  
  const formData = {id, description, duration: parseInt(duration), date, username: user?.username}
  await Exercise.create({...formData, id: null})
  await createLogs(formData)
  return res.json(formData)
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const _id = req.params._id
  const from = req.query.from
  const to = req.query.to
  const limit = req.query.limit

  const user = await User.findOne({_id})

  const logsForUser = await Log.findOne({username: user?.username})

  const returnLogs = (logs) => {
    const dateFrom = new Date(from)
    const dateTo = new Date(to)

    const datesFrom = from ? logs.filter((log) => new Date(log.date) >= dateFrom) : []
    const datesTo = to ? logs.filter((log) => new Date(log.date) <= dateTo) : []

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

  const logs = returnLogs(logsForUser.log)

  console.log('logs', logs)

  return res.json({user: logs})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})