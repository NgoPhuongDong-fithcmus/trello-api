import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
const router = express.Router()

router.route('/register')
  .post(userValidation.createNew, userController.createNew)


export const userRoute = router