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

export const boardRoute = router