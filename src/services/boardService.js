/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
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

    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetailBoard
}