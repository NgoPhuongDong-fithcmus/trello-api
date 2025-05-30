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

const update = async ( req, res, next ) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

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