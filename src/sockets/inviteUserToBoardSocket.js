export const inviteUserToBoardSocket = (socket) => {
  // eslint-disable-next-line no-console
  // console.log(`Socket connected: ${socket.id}`)
  // Lắng nghe sự kiện từ client
  socket.on('CLIENT_USER_INVITED_TO_BOARD', (invitation) => {
    // Cách xử lý sự kiện này là phát đi sự kiện cho tất cả các client khác ngoại trừ client đã gửi sự kiện này
    socket.broadcast.emit('SERVER_USER_INVITED_TO_BOARD', invitation)
  })

  // Xử lý sự kiện khi có người dùng kết nối
  socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
    console.log(`Socket disconnected: ${socket.id}`)
  })
}