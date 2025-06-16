import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}


const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  verifyTokenResetPassword: Joi.string().default(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  require_2fa: Joi.boolean().default(false),
  is_2fa_verified: Joi.boolean().default(false),
  _destroy: Joi.boolean().default(false)
})

// Những field không được cập nhật. BE xử lí để tránh khi client gửi nhầm
const FORBIDDEN_UPDATE_FIELD = ['_id', 'email', 'username', 'createdAt']

// validate schema để các trường có default đc thêm vào db
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: true })
}

const createNew = async (data) => {
  try {

    const validData = await validateBeforeCreate(data)

    return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(userId))
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: emailValue
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updateData) => {
  try {
    // Kiểm tra các field bị cấm mà client gửi lên
    Object.keys(updateData).forEach(field => {
      if (FORBIDDEN_UPDATE_FIELD.includes(field)) {
        delete updateData[field]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(userId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update
}