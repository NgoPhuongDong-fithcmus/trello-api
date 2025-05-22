import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list columns!' })
  })
  .post(columnValidation.createNew, columnController.createNew)

// router.route('/:id')
//   .get(columnController.getDetailBoard)

router.route('/:id')
  .put(columnValidation.update, columnController.update)

export const columnRoute = router