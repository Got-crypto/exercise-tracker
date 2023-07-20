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

app.post('/api/users', async (req, res) => {
  const username = req.body

  const doc = await User.create(username)

  return res.json({username: doc?.username, _id: doc?._id?.toString()})
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
