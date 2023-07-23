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


const Exercise = model('Exercise', exerciseSchema)
const User = model('User', userSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

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

  const fd = {
    username: user?.username,
    description,
    duration: parseInt(duration),
  }

  if (date === "") {
    const newDate = new Date()

    const dateString = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`

    const formData = {...fd, date: dateString}

    await Exercise.create(formData)

    return res.json({_id: user._id, ...formData, date: newDate.toDateString()})
  }

  const formData = {...fd, date}

  await Exercise.create(formData)
  
  return res.json({_id: user._id, ...formData, date: new Date(date).toDateString()})
})

const getUserLogs = async (username, from, to, limit) => {

  const filterQuery = from && to ? {
    username,
    date: {
      $gte: from,
      $lte: to
    }
  } : from ? {
    username,
    date: {
      $gte: from,
    }
  } : to ? {
    username,
    date: {
      $lte: to
    }
  } : {
    username
  }

  return await Exercise.find(filterQuery).limit(limit && parseInt(limit))
}

app.get('/api/users/:_id/logs', async (req, res) => {
  const fromQuery = req.query.from
  const toQuery = req.query.to

  const _id = req.params._id
  const from = fromQuery
  const to = toQuery
  const limit = req.query.limit

  const user = await User.findOne({_id})

  const logsForUser = await getUserLogs(user?.username, from, to, limit)

  const logs = logsForUser

  let fixedLogs = []

  for(let log of logs) {
    const data = {
      description: log?.description,
      duration: log?.duration,
      date: new Date(log?.date).toDateString()
    }

    fixedLogs.push(data)
  }

  const data = {
    _id: user?._id, username: user?.username,
    count: fixedLogs.length,
    log: fixedLogs
  }

  return res.json(data)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})