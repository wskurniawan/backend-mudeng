import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as morgan from 'morgan'

import { Account } from "../Model/Account";
import { signupHandler, signinHandler, getAccountPetHandler, setAccountPetHandler, getAvailablePetHandler } from './Handler/Account';
import { sessionValidatorMiddleware } from './Middleware.ts/Session';
import { getSoalHandler, nilaiMaiHandler } from './Handler/MaiTest';
import { CustomError, LibraryError } from '../Error/Error';

declare global {
  namespace Express {
    interface Request {
      user: Account
    }
  }
}

export function initApp(): express.Express {
  const app = express()

  const router = express.Router()

  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(morgan('combined'))

  router.post('/signup', signupHandler)
  router.post('/signin', signinHandler)

  router.get('/pet', sessionValidatorMiddleware, getAvailablePetHandler)
  router.get('/profile/pet', sessionValidatorMiddleware, getAccountPetHandler)
  router.post('/profile/pet', sessionValidatorMiddleware, setAccountPetHandler)

  router.get('/mai/soal', sessionValidatorMiddleware, getSoalHandler)
  router.post('/mai/submit', sessionValidatorMiddleware, nilaiMaiHandler)
  router.use(function(err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction){
    if(!err.httpCode) {
      res.status(500).send(LibraryError(err.message))
      return
    }

    return res.status(err.httpCode).send(err)
  })

  app.use(router)

  return app
}