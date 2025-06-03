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

const getAllInvitations = async ( req, res, next ) => {
  try {
    const userId = req.jwtDecoded._id

    const invitations = await invitationService.getAllInvitations(userId)

    res.status(StatusCodes.OK).json(invitations)
  } catch (error) {
    next(error)
  }
}

const update = async ( req, res, next ) => {
  try {
    const { invitationId } = req.params
    const userId = req.jwtDecoded._id
    const { status } = req.body

    const updatedInvitation = await invitationService.update(invitationId, userId, status)

    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) {
    next(error)
  }
}

export const invitationController = {
  createNewInvitationInBoard,
  getAllInvitations,
  update
}