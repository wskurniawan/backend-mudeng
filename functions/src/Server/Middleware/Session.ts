import { Request, Response, NextFunction } from 'express'
import { AccountController } from '../../Controller/Account'

export async function sessionValidatorMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.session as string
  let user
  try {
    user = await AccountController.getInstance().validateToken(token)
  } catch (error) {
    next(error)
    return
  }

  req.user = user
  next()
}