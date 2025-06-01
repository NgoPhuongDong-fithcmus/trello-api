import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { invitationValidation } from '~/validations/invitationValidation'
const router = express.Router()


router.route('/board')
  .post(authMiddleware.isAuthorized, invitationValidation.createNewInvitationInBoard, invitationController.createNewInvitationInBoard)
export const invitationRoute = router