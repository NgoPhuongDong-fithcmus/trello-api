/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
// import ApiError from '~/utils/ApiError'
// import { StatusCodes } from 'http-status-codes'
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

export const columnService = {
  createNew
}