/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
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

const update = async (cardId, updateData, cardFile) => {
  try {

    const updateCard = {
      ...updateData,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardFile.buffer, 'cards-cover')

      // Lưu lại URL(secure_url) của file ảnh vào DB
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    }
    // Update binh thuong
    else {
      updatedCard = await cardModel.update(cardId, updateCard)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}