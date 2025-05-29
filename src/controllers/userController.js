import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

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

const login = async ( req, res, next ) => {

  try {
    const result = await userService.login(req.body)

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
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const logout = async ( req, res, next ) => {

  try {
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

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}