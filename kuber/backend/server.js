import express from 'express'
import morgan from "morgan";
const app = express()
app.use(morgan('dev'))
const PORT = 3000



app.get('/', (req, res) => {
  let sum = 0
  for (let i = 0; i < 100000000; i++) {
    // Simulate a long-running task
    sum += i
  }
  return res.status(200).json({ message: 'Hello, World!', sum })
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})