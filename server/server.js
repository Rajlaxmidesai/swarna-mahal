
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const authRoutes = require('./routes/authRoutes')
const { protect } = require('./middleware/authMiddleware')
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Swarna Mahal API!',
    status: 'Backend is running successfully',
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})
app.get('/api/auth/me', protect, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: req.user,
  })
})
async function startServer() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Swarna Mahal API running on http://localhost:${PORT}`)
  })
}

startServer()
