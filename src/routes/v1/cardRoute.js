import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list cards!' })
  })
  .post(cardValidation.createNew, cardController.createNew)

// router.route('/:id')
//   .get(cardController.getDetailBoard)

export const cardRoute = router