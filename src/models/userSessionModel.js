import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
// import { ObjectId } from 'mongodb'
// import { GET_DB } from '~/config/mongodb'


const USER_SESSION_COLLECTION_NAME = 'user_sessions'
const USER_SESSION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  deviceId: Joi.string().required(),
  is_2fa_verified: Joi.boolean().default(false),
  last_login: Joi.date().timestamp('javascript').default(Date.now),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const validateBeforeCreateUserSession = async (data) => {
  return await USER_SESSION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: true })
}

export const findOneUserSession = async (userId, deviceId) => {
  try {
    return await GET_DB().collection(USER_SESSION_COLLECTION_NAME).findOne({ userId, deviceId })
  } catch (error) {
    throw new Error(error)
  }
}

export const insertOneUserSession = async (data) => {
  try {
    const validData = await validateBeforeCreateUserSession(data)

    // Chuyển userId sang ObjectId nếu cần
    const insertedData = {
      ...validData,
      userId: new ObjectId(String(validData.userId))
    }

    const result = await GET_DB().collection(USER_SESSION_COLLECTION_NAME).insertOne(insertedData)

    const insertedSession = await GET_DB().collection(USER_SESSION_COLLECTION_NAME).findOne({
      _id: result.insertedId
    })

    return insertedSession
  } catch (error) {
    throw new Error(error)
  }
}

// export const updateUserSession = async (updateData) => {
//   try {
//     const validData = await USER_SESSION_COLLECTION_SCHEMA.validateAsync(updateData, { abortEarly: true })

//     // Chuyển userId sang ObjectId nếu cần
//     const updatedData = {
//       ...validData,
//       userId: new ObjectId(String(validData.userId)) // Giả sử userId là chuỗi, nếu là ObjectId thì cần chuyển đổi
//     }

//     // return await GET_DB().collection(USER_SESSION_COLLECTION_NAME).findOneAndUpdate(
//     //   { userId: updatedData.userId, deviceId: updatedData.deviceId },
//     //   { $set: updatedData }
//     // )

//     return await GET_DB().collection(USER_SESSION_COLLECTION_NAME).findOneAndUpdate(
//       { userId: updatedData.userId, deviceId: updatedData.deviceId },
//       { $set: updatedData },
//       { returnDocument: 'after' } // Trả về tài liệu đã cập nhật
//     )
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const updateUserSession = async (filter, dataToUpdate, options = { returnDocument: 'after' }) => {
  try {
    // Kiểm tra filter có hợp lệ không
    const validFilter = {
      userId: new ObjectId(String(filter.userId)),
      deviceId: filter.deviceId
    }

    // Optional: validate dataToUpdate nếu cần
    return await GET_DB().collection(USER_SESSION_COLLECTION_NAME).findOneAndUpdate(
      validFilter,
      dataToUpdate,
      options
    )
  } catch (error) {
    throw new Error(error)
  }
}


const deleteOneUserSession = async ({ userId, deviceId }) => {
  try {
    return await GET_DB().collection(USER_SESSION_COLLECTION_NAME).deleteMany({ userId, deviceId })
  } catch (error) {
    throw new Error(error)
  }
}

export const userSessionModel = {
  USER_SESSION_COLLECTION_NAME,
  USER_SESSION_COLLECTION_SCHEMA,
  insertOneUserSession,
  updateUserSession,
  findOneUserSession,
  deleteOneUserSession
}