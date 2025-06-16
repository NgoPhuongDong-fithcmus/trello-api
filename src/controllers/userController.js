import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import ms from 'ms'
import { env } from '~/config/environment'
import { userSessionModel } from '~/models/userSessionModel'
import { JwtProvider } from '~/providers/JwtProvider'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const getUserById = async ( req, res, next ) => {
  try {
    const userId = req.params.userId
    const result = await userService.getUserById(userId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createNew = async ( req, res, next ) => {

  try {
    const createUser = await userService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async ( req, res, next ) => {

  try {
    const result = await userService.verifyAccount(req.body)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const verifyResetPassword = async ( req, res, next ) => {

  try {
    const result = await userService.verifyResetPassword(req.body)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async ( req, res, next ) => {

  try {
    const deviceId = req.headers['user-agent']
    const result = await userService.login(req.body, deviceId)

    // Xử lí trả về cookie cho phía trình duyệt
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('1 year')
    })

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const logout = async ( req, res, next ) => {

  try {
    const accessToken = req.cookies.accessToken

    if (accessToken) {
      // Nếu có token thì giải mã và xóa session khỏi DB
      const decoded = await JwtProvider.verifyToken(
        accessToken,
        env.ACCESS_TOKEN_SECRET_SIGNATURE
      )

      const userId = decoded._id
      const deviceId = req.headers['user-agent']

      await userSessionModel.deleteOneUserSession({
        userId: new ObjectId(String(userId)),
        deviceId
      })
    }
    // res.clearCookie('accessToken', {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none'
    // })
    // res.clearCookie('refreshToken', {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none'
    // })
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.CREATED).json({ message: 'Logout successfully!', logout: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async ( req, res, next ) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'You are not logged in! Please login again!'))
  }
}

const update = async ( req, res, next ) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file

    const updateUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updateUser)
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async ( req, res, next ) => {
  try {
    const result = await userService.forgotPassword(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const resetPassword = async ( req, res, next ) => {
  try {
    const result = await userService.resetPassword(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const get2FAQRCode = async ( req, res, next ) => {
  try {
    const userId = req.params.userId
    const result = await userService.get2FAQRCode(userId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const setup2FA_QRCode = async ( req, res, next ) => {
  try {
    const userId = req.params.userId
    const otpToken = req.body.otpToken
    const deviceId = req.headers['user-agent']
    if (!otpToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP token is required!')
    }
    const result = await userService.setup2FA_QRCode(userId, otpToken, deviceId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const verify2FA = async ( req, res, next ) => {
  try {
    const userId = req.params.userId
    const otpToken = req.body.otpToken
    const deviceId = req.headers['user-agent']
    if (!otpToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP token is required!')
    }
    const result = await userService.verify2FA(userId, otpToken, deviceId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update,
  forgotPassword,
  verifyResetPassword,
  setup2FA_QRCode,
  resetPassword,
  get2FAQRCode,
  verify2FA,
  getUserById
}