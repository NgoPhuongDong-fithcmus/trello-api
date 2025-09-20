/* eslint-disable no-console */
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { messageModel } from '~/models/messageModel'
import { userModel } from '~/models/userModel'

export const sendMessageInBoardSocket = (socket) => {
  socket.on('JOIN_BOARD', (boardId) => {
    socket.join(boardId)
    // console.log(`Socket ${socket.id} joined board ${boardId}`)
  })
  socket.on('CLIENT_SEND_MESSAGE', async ({ boardId, msg, userId }) => {
    try {
      const newMsg = {
        boardId: new ObjectId(String(boardId)),
        senderId: new ObjectId(String(userId)),
        text: msg.text,
        attachments: msg.attachments || [],
        createdAt: Date.now(),
        updatedAt: null,
        _destroy: false
      }

      const result = await GET_DB()
        .collection(messageModel.MESSAGE_COLLECTION_NAME)
        .insertOne(newMsg)

      const sender = await userModel.findOneById(userId)

      const payload = {
        _id: result.insertedId,
        text: newMsg.text,
        createdAt: newMsg.createdAt,
        sender: {
          _id: sender._id,
          username: sender.username
        }
      }


      socket.to(boardId).emit('SERVER_SEND_MESSAGE', payload)

      socket.emit('SERVER_SEND_MESSAGE', payload)
    } catch (err) {
      console.error('Error saving message:', err)
    }
  })

  socket.on('CLIENT_TYPING_MESSAGE', ({ boardId, userId }) => {
    socket.to(boardId).emit('SERVER_TYPING_MESSAGE', { userId })
  })

  socket.on('CLIENT_STOP_TYPING_MESSAGE', ({ boardId, userId }) => {
    socket.to(boardId).emit('SERVER_STOP_TYPING_MESSAGE', { userId })
  })
  socket.on('disconnect', () => {
    // console.log(`Socket ${socket.id} disconnected`)
  })
}
