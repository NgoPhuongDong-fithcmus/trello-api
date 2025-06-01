/* eslint-disable no-console */
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
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

export const invitationService = {
  createNewInvitationInBoard
}