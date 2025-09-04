import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64e12f91cf10ba001ed7d999"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           writeOnly: true
 *           example: "••••••••"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         displayName:
 *           type: string
 *           example: "John Doe"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/avatar.jpg"
 *         role:
 *           type: string
 *           enum: [client, admin]
 *           example: client
 *         isActive:
 *           type: boolean
 *           example: false
 *         verifyToken:
 *           type: string
 *           example: "a1b2c3d4e5"
 *         verifyTokenResetPassword:
 *           type: string
 *           nullable: true
 *           example: "r3s3tp4ss"
 *         require_2fa:
 *           type: boolean
 *           description: Whether user has enabled 2FA
 *           example: true
 *         is_2fa_verified:
 *           type: boolean
 *           description: Whether user has verified the current 2FA challenge
 *           example: false
 *         createdAt:
 *           type: integer
 *           format: int64
 *           example: 1690924532332
 *         updatedAt:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 1690939999999
 *         _destroy:
 *           type: boolean
 *           description: Soft delete flag
 *           example: false
 */


router.route('/register')
  .post(userValidation.createNew, userController.createNew)

router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: gonpro53@gmail.com
 *               password:
 *                 type: string
 *                 example: caubebabyboy1
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: your.jwt.token
 *                 refreshToken:
 *                   type: string
 *                   example: your.refresh.token
 *       401:
 *         description: Incorrect credentials
 */
router.route('/login')
  .post(userValidation.login, userController.login)

router.route('/forgot_password')
  .post(userValidation.forgotPassword, userController.forgotPassword)

router.route('/resend_verification')
  .post(userValidation.resendVerification, userController.resendVerification)

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