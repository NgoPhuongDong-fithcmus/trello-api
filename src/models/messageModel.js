// eslint-disable-next-line no-undef
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'

const MESSAGE_COLLECTION_NAME = 'messages'
const MESSAGE_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  senderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  text: Joi.string().allow('').trim(),
  attachments: Joi.array().items(Joi.string().uri()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const findByBoardId = async (boardId) => {
  const messages = await GET_DB()
    .collection(MESSAGE_COLLECTION_NAME)
    .find({ boardId: new ObjectId(String(boardId)), _destroy: false })
    .sort({ createdAt: 1 })
    .toArray()
  return messages
}

export const messageModel = {
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA,
  findByBoardId
}