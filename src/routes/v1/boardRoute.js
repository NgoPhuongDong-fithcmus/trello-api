import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Quản lý dự án
 *         slug:
 *           type: string
 *           example: quan-ly-du-an
 *         description:
 *           type: string
 *           example: Bảng này dùng để theo dõi tiến độ dự án
 *         type:
 *           type: string
 *           enum: [public, private]
 *           example: public
 *         columnOrderIds:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         ownerIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64c1f44e4c3b4c001e9e0000"]
 *         memberIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64c1f44e4c3b4c001e9e0001", "64c1f44e4c3b4c001e9e0002"]
 *         createdAt:
 *           type: integer
 *           format: int64
 *           example: 1690862768123
 *         updatedAt:
 *           type: integer
 *           format: int64
 *           example: 1690862780000
 *         _destroy:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get a list of boards
 *     tags: [Boards]
 *     responses:
 *       200:
 *         description: Returns a list of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       201:
 *         description: Successfully created a new board
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Unprocessable entity, validation error
 *       500:
 *         description: Internal server error
 */

router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getListBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)


/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Get board details by ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The board ID
 *     responses:
 *       200:
 *         description: Board details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Invalid board ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     summary: Update a board by ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Invalid board ID or data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 *       500:
 *         description: Internal server error
 */
router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetailBoard)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

/**
 * @swagger
 * /boards/supports/moving_card:
 *   put:
 *     summary: Move a card between columns
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentColumnId:
 *                 type: string
 *               nextColumnId:
 *                 type: string
 *               cardId:
 *                 type: string
 *             required:
 *               - currentColumnId
 *               - nextColumnId
 *               - cardId
 *     responses:
 *       200:
 *         description: Card moved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card or column not found
 *       500:
 *         description: Internal server error
 */
router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardsToDifferentColumnApi, boardController.moveCardsToDifferentColumnApi)
export const boardRoute = router