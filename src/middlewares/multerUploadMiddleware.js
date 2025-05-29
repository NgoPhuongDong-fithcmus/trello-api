import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'


const customeFileFilter = (req, file, callback) => {
  console.log('Multer file: ', file)

  // Đối với multer, kiểm tra kiểu file bằng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }

  // Nếu file hợp lệ thì tiếp tục
  return callback(null, true)
}

// Khởi tạo function multer với cấu hình
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customeFileFilter
})

export const multerUploadMiddleware = { upload }