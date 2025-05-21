/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    }

    const createNewBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createNewBoard.insertedId)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetailBoard = async (boardId) => {
  try {
    const board = await boardModel.getDetailBoard(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // ------------------------BE XỬ LÍ DỮ LIỆU-----------------------------
    // deep clone board để tạo ra board mới để xử lí, không ảnh hưởng tới board ban đầu tùy mục đích sử dụng
    const respondBoard = cloneDeep(board)

    // đưa card về đúng column của nó => biến đổi sao cho dữ liệu chuẩn chỉ bên BE xử lí hoặc FE cũng có thể xử lí
    respondBoard.columns.forEach(column => {
      // column.cards = respondBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
      // có thể dùng cách này
      column.cards = respondBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete respondBoard.cards
    // ------------------------BE XỬ LÍ DỮ LIỆU-----------------------------

    return respondBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    if (!updatedBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    return updatedBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetailBoard,
  update
}