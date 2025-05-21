/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
// import ApiError from '~/utils/ApiError'
// import { StatusCodes } from 'http-status-codes'
// import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {
    const newCard = {
      ...data,
      slug: slugify(data.title)
    }

    const createNewCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createNewCard.insertedId)

    if (getNewCard) {

      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}