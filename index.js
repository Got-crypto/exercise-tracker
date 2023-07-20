const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

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

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
