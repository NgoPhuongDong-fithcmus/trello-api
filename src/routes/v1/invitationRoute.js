import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { invitationValidation } from '~/validations/invitationValidation'
const router = express.Router()

router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getAllInvitations)

router.route('/board')
  .post(authMiddleware.isAuthorized, invitationValidation.createNewInvitationInBoard, invitationController.createNewInvitationInBoard)

router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized, invitationController.update)
export const invitationRoute = router