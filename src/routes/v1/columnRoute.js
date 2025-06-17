import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()


router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list columns!' })
  })
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

// router.route('/:id')
//   .get(columnController.getDetailBoard)

router.route('/:id')
  .put(authMiddleware.isAuthorized, columnValidation.update, columnController.update)
  .delete(authMiddleware.isAuthorized, columnValidation.deleteColumn, columnController.deleteColumn)

export const columnRoute = router