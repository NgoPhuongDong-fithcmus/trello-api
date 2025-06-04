// eslint-disable-next-line no-undef
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { skipPage } from '~/utils/algorithms'
import { userModel } from './userModel'
// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những thành viên của board, có thể là admin hoặc không
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Những field không được cập nhật. BE xử lí để tránh khi client gửi nhầm
const FORBIDDEN_UPDATE_FIELD = ['_id', 'createdAt']

// validate schema để các trường có default đc thêm vào db
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: true })
}

const createNew = async (userId, data) => {
  try {

    const validData = await validateBeforeCreate(data)

    const newBoardCreated = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))],
      memberIds: [new ObjectId(String(userId))]
    }

    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardCreated)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailBoard = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })

    const queryCondition = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    // aggregate lấy dữ liệu giống như query SQL vậy
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryCondition } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        pipeline: [
          { $project: { password: 0, verifyToken: 0 } }
        ]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          { $project: { password: 0, verifyToken: 0 } }
        ]
      } }
    ]).toArray()

    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// push columnId vao cuoi mang columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    // Kiểm tra các field bị cấm mà client gửi lên
    Object.keys(updateData).forEach(field => {
      if (FORBIDDEN_UPDATE_FIELD.includes(field)) {
        delete updateData[field]
      }
    })

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getListBoards = async (userId, pageNumber, itemsPerPage, querySearchPath) => {
  try {
    const queryCondition = [
      // Điều kiện 1: board chưa bị xóa
      { _destroy: false },
      // Điều kiện 2: userId đang thực hiện req phải thuộc vào một trong 2 cái mảng ownerIds hoặc menberIds, dùng toán tử $all của mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ]
      }
    ]

    // Nếu có querySearchPath thì thêm vào điều kiện tìm kiếm
    if (querySearchPath) {
      // xử lý querySearchPath là một object, và mỗi key của nó sẽ là một trường trong board cần tìm kiếm
      // Ví dụ: querySearchPath = { title: 'abc', description: 'xyz' }
      Object.keys(querySearchPath).forEach(key => {
        const searchRegex = new RegExp(querySearchPath[key], 'i')
        queryCondition.push({ [key]: { $regex: searchRegex } })
      })
    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryCondition } },
        { $sort: { title: 1 } }, // sort theo title A -> Z
        { $facet: {
          // Luồng 1: Query boards
          'queryBoards': [
            { $skip: skipPage(pageNumber, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          // Luồng 2: Query đếm tổng tất cả số lượng boards trong DB và trả về vào biến countedAllBoards
          'totalBoards': [
            { $count: 'countedAllBoards' }
          ]
        } }
      ],
      { collation: { locale: 'en', strength: 2 } } // strength: 2 là so sánh không phân biệt chữ hoa chữ thường
    ).toArray()

    return {
      boards: query[0].queryBoards || [],
      totalBoards: query[0].totalBoards.length > 0 ? query[0].totalBoards[0].countedAllBoards : 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const pushMembersToBoard = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $addToSet: { memberIds: new ObjectId(String(userId)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetailBoard,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getListBoards,
  pushMembersToBoard
}

// String(id)