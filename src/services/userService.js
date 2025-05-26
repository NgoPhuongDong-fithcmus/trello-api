/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickInfoUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

const createNew = async (reqBody) => {
  try {

    // Kiểm tra email đã tồn tại trong db chưa
    const existedEmail = await userModel.findOneByEmail(reqBody.email)
    if (existedEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already existed!')
    }
    // Tạo data để lưu vào db
    // Lấy username từ email
    const usernameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // tham số thứ 2 càng cao thì băm càng lâu
      username: usernameFromEmail,
      displayName: usernameFromEmail,
      verifyToken: uuidv4()
    }

    // Lưu user vào db
    const createNewUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createNewUser.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'PLEASE VERIFY YOUR EMAIL BEFORE USING OUR SERVICES'
    const htmlContent = `
      <h3>Click link to verify:</h3>
      <h3>${verificationLink}</h3>
      <h3>babyboy, thanks for coming</h3>
    `

    // Gọi Provider gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    return pickInfoUser(getNewUser)
  } catch (error) {
    throw error
  }
}
export const userService = {
  createNew
}