/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
const createNew = async (userId, reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createNewBoard = await boardModel.createNew(userId, newBoard)
    const getNewBoard = await boardModel.findOneById(createNewBoard.insertedId)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetailBoard = async (userId, boardId ) => {
  try {
    const board = await boardModel.getDetailBoard(userId, boardId)

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

const moveCardsToDifferentColumnApi = async (reqBody) => {
  try {
    // + Cập nhật cardOrderIds của column ban đầu chứa nó
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // + Cập nhật cardOrderIds của column sẽ chứa nó
    await columnModel.update(reqBody.currentCardId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // + Cập nhật lại columnId của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updatedResult: 'Succesfully moving card to different column!' }
  } catch (error) {
    throw error
  }
}

const getListBoards = async (userId, pageNumber, itemsPerPage, querySearchPath) => {
  try {

    if (!pageNumber || isNaN(pageNumber) || pageNumber < 1) {
      pageNumber = DEFAULT_PAGE
    }

    if (!itemsPerPage || isNaN(itemsPerPage) || itemsPerPage < 1) {
      itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    }

    const result = await boardModel.getListBoards(userId, parseInt(pageNumber), parseInt(itemsPerPage), querySearchPath)
    return result
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetailBoard,
  update,
  moveCardsToDifferentColumnApi,
  getListBoards
}