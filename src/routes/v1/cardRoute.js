import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list cards!' })
  })
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

router.route('/:id')
  .put(authMiddleware.isAuthorized, multerUploadMiddleware.upload.single('cardCover'), cardValidation.update, cardController.update)

export const cardRoute = router