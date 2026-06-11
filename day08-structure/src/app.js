const express = require('express')
const usersRouter = require('./routes/users')
const errorHandler = require('./middleware/errorHandler')

const app = express()
app.disable('x-powered-by')
app.use(express.json())

app.use('/api/v1/users', usersRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'route not found' })
})

app.use(errorHandler)

module.exports = app