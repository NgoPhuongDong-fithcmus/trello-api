import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
const router = express.Router()

router.route('/register')
  .post(userValidation.createNew, userController.createNew)

router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

router.route('/login')
  .post(userValidation.login, userController.login)


export const userRoute = router