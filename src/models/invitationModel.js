// eslint-disable-next-line no-undef
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
// Define Collection (name & schema)

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const FORBIDDEN_UPDATE_FIELD = ['_id', 'createdAt', 'inviteeId', 'inviterId', 'type']

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: true })
}

const createNewInvitationInBoard = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    let newDataInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(String(validData.inviterId)),
      inviteeId: new ObjectId(String(validData.inviteeId))
    }

    // nếu tồn tại boardInvitation thì update cho boardId
    if (validData.boardInvitation) {
      newDataInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(String(validData.boardInvitation.boardId))
      }
    }

    return await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newDataInvitationToAdd)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (inviteeId) => {
  try {
    const invitee = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(inviteeId)),
      _destroy: false
    })

    return invitee

  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach(field => {
      if (FORBIDDEN_UPDATE_FIELD.includes(field)) {
        delete updateData[field]
      }
    })

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(invitationId)), _destroy: false },
      { $set: { ...updateData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )

    return result

  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewInvitationInBoard,
  findOneById,
  update
}