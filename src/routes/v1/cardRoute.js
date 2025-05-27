import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list cards!' })
  })
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)


export const cardRoute = router