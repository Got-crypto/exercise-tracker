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
    const newDate = new Date().toUTCString()

    const formData = {id, description, duration: parseInt(duration), newDate, username: user?.username}

    Exercise.create({...formData, id: null})
    
    return res.json(formData)
  }
  
  const formData = {id, description, duration: parseInt(duration), date, username: user?.username}
  Exercise.create({...formData, id: null})
  return res.json(formData)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})