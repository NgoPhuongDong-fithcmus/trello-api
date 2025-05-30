import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const router = express.Router()


router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getListBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetailBoard)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardsToDifferentColumnApi, boardController.moveCardsToDifferentColumnApi)
export const boardRoute = router