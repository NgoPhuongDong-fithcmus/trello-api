/* eslint-disable no-console */

// gonpro53
// RHoe5k6UlYdtTxeK

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null vì chưa kết nối db
let trelloDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  try {
    // Kiểm tra xem đã kết nối hay chưa
    if (trelloDatabaseInstance) {
      return trelloDatabaseInstance
    }

    // Kết nối đến MongoDB
    await mongoClientInstance.connect()

    // Lấy database
    trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

    return trelloDatabaseInstance
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

// Function GET_DB này có nhiệm vụ export ra trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  // Kiểm tra xem đã kết nối hay chưa
  if (!trelloDatabaseInstance) {
    throw new Error('Database not connected. Please call CONNECT_DB() first.')
  }

  return trelloDatabaseInstance
}

// Đống kết nối MongoDB khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}