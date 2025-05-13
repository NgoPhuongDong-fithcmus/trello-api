/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, GET_DB } from '~/config/mongodb'


const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Ngô Phương Đông, I am running at http://${ hostname }:${ port }/`)
  })
}

// // Chỉ khi kết nối thành công tới MongoDB thì mới chạy server
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB successfully!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error('Error connecting to MongoDB:', error)
//     process.exit(0)
//   })


// Chỉ khi kết nối thành công tới MongoDB thì mới chạy server
// Cách viết mới

( async () => {
  try {
    await CONNECT_DB()
    console.log('Connected to MongoDB successfully!')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(0)
  }
})()
