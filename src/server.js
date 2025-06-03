/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    //, no-cache, must-revalidate, proxy-revalidate
    next()
  })

  // Cấu hình cookie parser
  app.use(cookieParser())

  // Xử lí CORS
  app.use(cors(corsOptions))

  // chú ý phải có dòng này thì req.body gửi lên mới là json được
  app.use(express.json())

  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Tạo server HTTP
  const server = http.createServer(app)
  // Tạo socket.io instance
  const io = socketIo(server, {
    cors: corsOptions
  })
  // Kết nối socket.io với server
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  } )

  server.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    CLOSE_DB()
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
