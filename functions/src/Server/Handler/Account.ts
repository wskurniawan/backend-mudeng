import * as express from 'express'
import * as joi from '@hapi/joi'
import { ValidationError } from '../../Error/Error'
import { AccountController } from '../../Controller/Account'
import { AccountPet } from '../../Model/Account'
import { Pet } from '../../Model/PetModel'

export async function signupHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  const schema = joi.object().keys({
    email: joi.string().email().required(),
    nama: joi.string().required(),
    nim: joi.string().required(),
    password: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    next(ValidationError(error.message))
    return
  }

  let token
  try {
    token = await AccountController.getInstance().signup({ ...req.body, uid: '' })
  } catch (error) {
    next(error)
    return
  }

  res.cookie('session', token)
  res.status(200).send()
}

export async function signinHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  const schema = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    next(ValidationError(error.message))
    return
  }

  let token: string
  try {
    token = await AccountController.getInstance().signin(req.body)
  } catch (error) {
    next(error)
    return
  }

  res.cookie('session', token)
  res.status(200).send({ status: 200 })
}

export async function getAccountPetHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  let pet: AccountPet | null
  try {
    pet = await AccountController.getInstance().getUserPet(req.user.uid)
  } catch (error) {
    next(error)
    return
  }

  res.status(200).send(pet)
}

export async function setAccountPetHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  const schema = joi.object().keys({
    id: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    next(ValidationError(error.message))
    return
  }

  try {
    await AccountController.getInstance().setUserPet(req.user.uid, req.body.id)
  } catch (error) {
    next(error)
    return
  }

  return res.status(200).send()
}

export async function getAvailablePetHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  let result: Pet[]
  try {
    result = await AccountController.getInstance().getListPet()
  } catch (error) {
    next(error)
    return
  }

  res.send(result)
}

export async function getCommonProfileHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  let result
  try {
    result = await AccountController.getInstance().getCommonProfile(req.user.uid)
  } catch (error) {
    next(error)
    return
  }

  res.send(result)
}