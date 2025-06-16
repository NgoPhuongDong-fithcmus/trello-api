import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const router = express.Router()

router.route('/register')
  .post(userValidation.createNew, userController.createNew)

router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

router.route('/login')
  .post(userValidation.login, userController.login)

router.route('/forgot_password')
  .post(userValidation.forgotPassword, userController.forgotPassword)

router.route('/verify_resetPassword')
  .put(userValidation.verifyResetPassword, userController.verifyResetPassword)

router.route('/reset_password')
  .post(userValidation.resetPassword, userController.resetPassword)

router.route('/:userId')
  .get(authMiddleware.isAuthorized, userController.getUserById)

router.route('/:userId/get2FA_qrcode')
  .get(authMiddleware.isAuthorized, userController.get2FAQRCode)

router.route('/:userId/setup2FA_qrcode')
  .post(authMiddleware.isAuthorized, userController.setup2FA_QRCode)

router.route('/:userId/verify2fa')
  .post(authMiddleware.isAuthorized, userController.verify2FA)

router.route('/logout')
  .delete(userController.logout)

router.route('/refresh_tokens')
  .get(userController.refreshToken)

router.route('/update')
  .put(authMiddleware.isAuthorized, multerUploadMiddleware.upload.single('avatar'), userValidation.update, userController.update)

export const userRoute = router