/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
const createNew = async (req, res, next) => {
  try {
    const newBoard = {
      ...req,
      slug: slugify(req.title)
    }

    const createNewBoard = await boardModel.createNew(newBoard)
    console.log('createNewBoard: ', createNewBoard)

    const getNewBoard = await boardModel.findOneById(createNewBoard.insertedId)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}