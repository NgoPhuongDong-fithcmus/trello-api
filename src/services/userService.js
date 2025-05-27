/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickInfoUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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

const verifyAccount = async (reqBody) => {
  try {
    // Kiểm tra email có tồn tại trong db không
    const existedEmail = await userModel.findOneByEmail(reqBody.email)
    if (!existedEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Email is not existed!')
    }

    if (existedEmail.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already activated!')
    }

    // Kiểm tra token có đúng không
    if (existedEmail.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is not correct!')
    }

    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await userModel.update(existedEmail._id, updateData)

    return pickInfoUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // Kiểm tra email có tồn tại trong db không
    const existedEmail = await userModel.findOneByEmail(reqBody.email)
    if (!existedEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Email is not existed!')
    }

    // Kiểm tra tài khoản đã được kích hoạt chưa
    if (!existedEmail.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not activated! Please verify your email first. Then login again')
    }

    // Kiểm tra mật khẩu có đúng không
    const isPasswordCorrect = bcryptjs.compareSync(reqBody.password, existedEmail.password)
    if (!isPasswordCorrect) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is not correct!')
    }

    // Nếu mọi thứ ổn thì tạo token đăng nhập trả về FE
    // Tạo thông tin đính kèm trong JWT token: bao gồm _id và email của user
    const infoUser = {
      _id: existedEmail._id,
      email: existedEmail.email
    }

    // Tạo ra accessToken và refreshToken trả về FE
    const accessToken = await JwtProvider.generateToken(infoUser, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await JwtProvider.generateToken(infoUser, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    return { accessToken, refreshToken, ...pickInfoUser(existedEmail) }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}