import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'
import { env } from '~/config/environment'

// Middleware để xác thực JWT accessToken nhận được từ FE có hợp lệ không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken từ req.cookies phía client gửi lên -withCredentials trong file authorizeAxios
  const accessToken = req.cookies?.accessToken

  if (!accessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! No accessToken provided'))
  }

  try {
    const decoded = await JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    req.jwtDecoded = decoded
    next()
  } catch (error) {
    // Nếu accessToken hết hạn thì trả về lỗi GONE - 410 cho phía FE biết gọi lại refreshToken
    if (error?.message?.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Access token expired'))
    }

    // Nếu accessToken không hợp lệ thì trả về lỗi UNAUTHORIZED - 401
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }
}

export const authMiddleware = {
  isAuthorized
}