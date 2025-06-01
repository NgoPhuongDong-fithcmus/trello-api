import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'

const createNewInvitationInBoard = async ( req, res, next ) => {

  try {
    const inviterId = req.jwtDecoded._id

    const resInvitation = await invitationService.createNewInvitationInBoard(inviterId, req.body)

    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createNewInvitationInBoard
}