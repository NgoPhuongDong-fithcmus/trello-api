import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
import ApiError from '~/utils/ApiError'

const createNew = async ( req, res, next ) => {

  try {
    const userId = req.jwtDecoded._id
    const createBoard = await boardService.createNew(userId, req.body)
    if (!createBoard) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Create board failed!'))
    }

    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) {
    next(error)
  }
}

const getDetailBoard = async ( req, res, next ) => {
  try {
    const boardId = req.params.id
    const userId = req.jwtDecoded._id

    const board = await boardService.getDetailBoard(userId, boardId)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async ( req, res, next ) => {
  try {
    const boardId = req.params.id

    const querySearchPath = req.query.searchPath

    const updatedBoard = await boardService.update(boardId, req.body, querySearchPath)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const moveCardsToDifferentColumnApi = async ( req, res, next ) => {
  try {
    const result = await boardService.moveCardsToDifferentColumnApi(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getListBoards = async ( req, res, next ) => {
  try {
    const userId = req.jwtDecoded._id

    const { pageNumber, itemsPerPage } = req.query
    const result = await boardService.getListBoards(userId, pageNumber, itemsPerPage)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }

}

export const boardController = {
  createNew,
  getDetailBoard,
  update,
  moveCardsToDifferentColumnApi,
  getListBoards
}