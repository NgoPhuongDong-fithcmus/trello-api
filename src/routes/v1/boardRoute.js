import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list boards!' })
  })
  .post(boardValidation.createNew, boardController.createNew)

router.route('/:id')
  .get(boardController.getDetailBoard)
  .put(boardValidation.update, boardController.update)

router.route('/supports/moving_card')
  .put(boardValidation.moveCardsToDifferentColumnApi, boardController.moveCardsToDifferentColumnApi)
export const boardRoute = router