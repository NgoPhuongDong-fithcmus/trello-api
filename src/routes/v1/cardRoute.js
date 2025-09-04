import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { cardController } from '~/controllers/cardController'
import { cardValidation } from '~/validations/cardValidation'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       required:
 *         - boardId
 *         - columnId
 *         - title
 *       properties:
 *         boardId:
 *           type: string
 *           description: ID of the board this card belongs to
 *           example: "64f101fcaf14252a98f90d23"
 *         columnId:
 *           type: string
 *           description: ID of the column this card belongs to
 *           example: "64f1021faf14252a98f90d25"
 *         slug:
 *           type: string
 *           description: Optional slug used for URLs
 *           example: "implement-login-feature"
 *         title:
 *           type: string
 *           description: Title of the card
 *           example: "Implement login feature"
 *         description:
 *           type: string
 *           description: Optional description of the card
 *           example: "This card is about creating the login feature with JWT"
 *         cover:
 *           type: string
 *           nullable: true
 *           description: URL of the cover image (if uploaded)
 *           example: "https://cdn.example.com/images/card-cover.png"
 *         memberIds:
 *           type: array
 *           description: Array of user IDs assigned to the card
 *           items:
 *             type: string
 *           example: ["64c1f44e4c3b4c001e9e0000"]
 *         comments:
 *           type: array
 *           description: Comments on the card
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c1f44e4c3b4c001e9e0001"
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               userAvatar:
 *                 type: string
 *                 example: "https://example.com/avatar.png"
 *               userDisplayName:
 *                 type: string
 *                 example: "John Doe"
 *               content:
 *                 type: string
 *                 example: "This needs to be done before the weekend"
 *               commentedAt:
 *                 type: integer
 *                 format: int64
 *                 example: 1690909919910
 *         createdAt:
 *           type: integer
 *           format: int64
 *           description: Timestamp in milliseconds
 *           example: 1690909810000
 *         updatedAt:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           example: 1690910010000
 *         _destroy:
 *           type: boolean
 *           description: Soft delete flag
 *           example: false
 */

router.route('/')
  .get(( req, res ) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list cards!' })
  })
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

router.route('/:id')
  .put(authMiddleware.isAuthorized, multerUploadMiddleware.upload.single('cardCover'), cardValidation.update, cardController.update)

export const cardRoute = router