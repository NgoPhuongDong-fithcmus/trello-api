/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'

const createNew = async (req, res, next) => {
  try {
    const newBoard = {
      ...req,
      slug: slugify(req.title)
    }
    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}