import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async ( req, res, next ) => {

  try {
    const createBoard = await boardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) {
    next(error)
  }
}

const getDetailBoard = async ( req, res, next ) => {
  try {
    const boardId = req.params.id

    const board = await boardService.getDetailBoard(boardId)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetailBoard
}