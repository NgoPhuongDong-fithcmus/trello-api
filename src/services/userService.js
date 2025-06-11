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
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

const verifyResetPassword = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)
    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Email is not existed!')
    }

    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Your account is not activated yet!')
    }

    if (existedUser.verifyTokenResetPassword !== reqBody.token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Reset token is not correct!')
    }

    const updateData = {
      isActive: true,
      verifyTokenResetPassword: null
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await userModel.update(existedUser._id, updateData)

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
    const accessToken = await JwtProvider.generateToken(
      infoUser,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      infoUser,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    return { accessToken, refreshToken, ...pickInfoUser(existedEmail) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  try {

    const refreshDecoded = await JwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Lưu những thông tin người dùng unique để tiết kiệm query vào DB để lấy data
    const userInfo = {
      _id: refreshDecoded._id,
      email: refreshDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Cập nhật thông tin người dùng
    const existedUser = await userModel.findOneById(userId)
    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not activated! Please verify your email first. Then login again')
    }

    let updatedUser = null

    // TH người dùng muốn đổi mật khẩu
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra mật cũ có đúng không
      const isPasswordCurrentCorrect = bcryptjs.compareSync(reqBody.current_password, existedUser.password)
      if (!isPasswordCurrentCorrect) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is not correct!')
      }
      // Nếu mật khẩu cũ đúng thì cập nhật mật khẩu mới vào db
      if (reqBody.new_password !== reqBody.new_password_confirmation) {
        throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'New password and confirmation do not match!')
      }
      updatedUser = await userModel.update(existedUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    }
    else if (userAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')

      // Lưu lại URL(secure_url) của file ảnh vào DB
      updatedUser = await userModel.update(existedUser._id, {
        avatar: uploadResult.secure_url
      })
    }
    // TH người dùng chỉ muốn cập nhật thông tin khác ngoài mật khẩu
    else {
      updatedUser = await userModel.update(existedUser._id, reqBody)
    }

    return pickInfoUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const forgotPassword = async (reqBody) => {
  try {
    // Kiểm tra email có tồn tại trong db không
    const existedEmail = await userModel.findOneByEmail(reqBody.email)
    if (!existedEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Email is not existed!')
    }

    // Tạo token mới để reset password
    const resetToken = uuidv4()

    // Cập nhật token vào db
    await userModel.update(existedEmail._id, { verifyTokenResetPassword: resetToken })

    // Gửi email cho người dùng với link reset password
    const resetLink = `${WEBSITE_DOMAIN}/account/reset-password?email=${existedEmail.email}&token=${resetToken}`
    const customSubject = 'PLEASE RESET YOUR PASSWORD'
    const htmlContent = `
      <h3>Click link to reset password:</h3>
      <h3>${resetLink}</h3>
      <h3>babyboy, thanks for coming</h3>
    `

    // Gọi Provider gửi email
    await BrevoProvider.sendEmail(existedEmail.email, customSubject, htmlContent)

  } catch (error) {
    throw error
  }
}

const resetPassword = async (reqBody) => {
  try {
    const { email, password, password_confirm } = reqBody

    // Kiểm tra email có tồn tại trong db không
    const existedEmail = await userModel.findOneByEmail(email)
    if (!existedEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Email is not existed!')
    }

    // Kiểm tra mật khẩu có giống nhau không
    if (password !== password_confirm) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Password confirmation does not match!')
    }

    // Cập nhật mật khẩu mới vào db
    const result = await userModel.update(existedEmail._id, {
      password: bcryptjs.hashSync(password, 8),
      verifyTokenResetPassword: null
    })

    return { result, message: 'Reset password successfully!' }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
  forgotPassword,
  verifyResetPassword,
  resetPassword
}