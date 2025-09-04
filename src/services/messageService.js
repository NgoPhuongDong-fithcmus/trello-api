import { StatusCodes } from 'http-status-codes'
import { messageModel } from '~/models/messageModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'

const getMessages = async (boardId) => {
  try {
    const messages = await messageModel.findByBoardId(boardId)

    // Lấy danh sách userId duy nhất
    const userIds = [...new Set(messages.map(m => m.senderId.toString()))]

    // Lấy tất cả user cùng lúc
    const users = await Promise.all(userIds.map(id => userModel.findOneById(id)))

    // Tạo map userId -> userInfo
    const userMap = new Map(users.map(u => [u._id.toString(), u]))

    // Trả về dữ liệu cho FE
    const result = messages.map(m => ({
      text: m.text,
      createdAt: m.createdAt,
      sender: {
        username: userMap.get(m.senderId.toString())?.username || 'Unknown'
      }
    }))
    return result
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}


export const messageService = {
  getMessages
}