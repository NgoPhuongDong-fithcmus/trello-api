import JWT from 'jsonwebtoken'


/**
 * Function tạo mới token - Cần 3 tham số
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: chữ kí bí mật để mã hóa token
 * tokenLife: thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(
      userInfo,
      secretSignature,
      { algorithm: 'HS256', expiresIn: tokenLife }
    )
  } catch (error) {
    throw new Error(error)
  }
}


/**
 * Function kiểm tra token có hợp lệ không
 * Hợp lệ ở đây là token được tạo ra có đúng với chữ kí bí mật không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}