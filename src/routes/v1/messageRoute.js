import express from 'express'
import { messageController } from '~/controllers/messageController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const router = express.Router()

router.route('/:boardId')
  .get(authMiddleware.isAuthorized, messageController.getMessages)

export const messageRoute = router