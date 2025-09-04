import { StatusCodes } from 'http-status-codes'
import { messageService } from '~/services/messageService'

const getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessages(req.params.boardId)
    res.status(StatusCodes.OK).json(messages)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
  }
}

export const messageController = {
  getMessages
}