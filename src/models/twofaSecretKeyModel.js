import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
// import { ObjectId } from 'mongodb'
// import { GET_DB } from '~/config/mongodb'


const TWO_FA_SECRET_KEY_COLLECTION_NAME = 'two_fa_secret_keys'
const TWO_FA_SECRET_KEY_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  secretValue: Joi.string().required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const validateBeforeCreate2FASecretKey = async (data) => {
  return await TWO_FA_SECRET_KEY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: true })
}

export const findOneByUserId = async ( userId ) => {
  return await GET_DB().collection(TWO_FA_SECRET_KEY_COLLECTION_NAME).findOne({ userId: new ObjectId(String(userId)) })
}

export const insertOneSecretKey = async (data) => {
  try {
    const validData = await validateBeforeCreate2FASecretKey(data)

    // chuyển userId sang ObjectId
    const insertedData = {
      ...validData,
      userId: new ObjectId(String(validData.userId)) // Chuyển đổi sang ObjectId nếu cần
    }

    return await GET_DB().collection(TWO_FA_SECRET_KEY_COLLECTION_NAME).insertOne(insertedData)
  } catch (error) {
    throw new Error(error)
  }
}

export const twoFaSecretKeyModel = {
  TWO_FA_SECRET_KEY_COLLECTION_NAME,
  TWO_FA_SECRET_KEY_COLLECTION_SCHEMA,
  findOneByUserId,
  insertOneSecretKey
}