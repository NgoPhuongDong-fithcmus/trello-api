/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cardModel } from '~/models/cardModel'
// import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {
    const newColumn = {
      ...data,
      slug: slugify(data.title)
    }

    const createNewColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createNewColumn.insertedId)

    if (getNewColumn) {
      // xu li data truoc khi tra du lieu ve
      getNewColumn.cards = []

      await boardModel.pushColumnOrderIds(getNewColumn)
    }


    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    if (!updatedColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteColumn = async (columnId) => {
  try {

    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    // Xóa column
    await columnModel.deleteOneById(columnId)
    // Xóa toàn bộ cards của column đó
    await cardModel.deleteCardsByColumnId(columnId)
    // Xóa columnId ra khỏi columnOrderIds của board
    await boardModel.pullColumnOrderIds(targetColumn)


    return { result: 'Column and its cards are deleted succesfully!' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteColumn
}