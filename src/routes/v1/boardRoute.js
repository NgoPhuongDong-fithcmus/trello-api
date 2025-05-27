import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list boards!' })
  })
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetailBoard)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

router.route('/supports/moving_card')
  .put(boardValidation.moveCardsToDifferentColumnApi, boardController.moveCardsToDifferentColumnApi)
export const boardRoute = router