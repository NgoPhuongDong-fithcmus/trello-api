/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickInfoUser } from '~/utils/formatter'

/* eslint-disable no-useless-catch */
const createNewInvitationInBoard = async (inviterId, reqBody) => {
  try {

    const inviter = await userModel.findOneById(inviterId)

    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    const board = await boardModel.findOneById(reqBody.boardId)

    if (!board || !inviter || !invitee) {
      throw new Error('Board, inviter, invitee not found')
    }

    // tạo ra lời mời lưu vào DB
    const newInvitationUserBoard = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }
    // console.log('🚀 ~ createNewInvitationInBoard ~ newInvitationUserBoard:', newInvitationUserBoard)

    const resultInvitation = await invitationModel.createNewInvitationInBoard(newInvitationUserBoard)
    // console.log('🚀 ~ createNewInvitationInBoard ~ resultInvitation:', resultInvitation)
    const getInvitation = await invitationModel.findOneById(resultInvitation.insertedId)

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickInfoUser(inviter),
      invitee: pickInfoUser(invitee)
    }
    // console.log('🚀 ~ createNewInvitationInBoard ~ resInvitation:', resInvitation)

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getAllInvitations = async (userId) => {
  try {
    const allInvitations = await invitationModel.findAllInvitationsByUser(userId)

    const resInvitations = allInvitations.map(i => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }))

    return resInvitations
  } catch (error) {
    throw error
  }
}

// Hàm update notifications
const update = async (invitationId, userId, status) => {
  try {
    const invitation = await invitationModel.findOneById(invitationId)

    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }

    const board = await boardModel.findOneById(invitation.boardInvitation.boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // Kiểm tra xem nếu status là ACCEPTED thì phải kiểm tra xem người dùng có thuộc ownerIds hoặc memberIds của board không
    const boardOwerAndMemberIds = [...board.ownerIds, ...board.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board')
    }

    // Tạo dữ liệu để update lời mời
    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status
      },
      updatedAt: Date.now()
    }


    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    // Nếu accept thành công thì thêm người dùng vào bản ghi memberIds của board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembersToBoard(board._id.toString(), userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewInvitationInBoard,
  getAllInvitations,
  update
}