import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as morgan from 'morgan'
import * as cors from 'cors'

import { Account } from "../Model/Account";
import { signupHandler, signinHandler, getAccountPetHandler, setAccountPetHandler, getAvailablePetHandler } from './Handler/Account';
import { sessionValidatorMiddleware } from './Middleware.ts/Session';
import { getSoalHandler, nilaiMaiHandler, getHasilMaiHandler } from './Handler/MaiTest';
import { CustomError, LibraryError } from '../Error/Error';
import { getDaftarMateriHandler, getMatkulHandler, getKontenMateriHandler, getQuizMateriHandler, getEvaluasiMateriHandler, getDaftarMatkulHandler } from './Handler/Materi'

declare global {
  namespace Express {
    interface Request {
      user: Account
    }
  }
}

export function initApp(): express.Express {
  const app = express()

  app.use(cors({ credentials: true, origin: true }))
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(morgan('combined'))

  const router = express.Router()

  router.post('/signup', signupHandler)
  router.post('/signin', signinHandler)

  router.get('/pet', sessionValidatorMiddleware, getAvailablePetHandler)
  router.get('/profile/pet', sessionValidatorMiddleware, getAccountPetHandler)
  router.post('/profile/pet', sessionValidatorMiddleware, setAccountPetHandler)

  router.get('/mai/soal', sessionValidatorMiddleware, getSoalHandler)
  router.post('/mai/submit', sessionValidatorMiddleware, nilaiMaiHandler)
  router.get('/mai/result', sessionValidatorMiddleware, getHasilMaiHandler)

  router.get('/matkul/daftar', sessionValidatorMiddleware, getDaftarMatkulHandler)
  router.get('/matkul/:idMatkul', sessionValidatorMiddleware, getMatkulHandler)
  router.get('/matkul/:idMatkul/materi', sessionValidatorMiddleware, getDaftarMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/konten/:tipeMateri', sessionValidatorMiddleware, getKontenMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/quiz/:tipeMateri', sessionValidatorMiddleware, getQuizMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/evaluasi', sessionValidatorMiddleware, getEvaluasiMateriHandler)

  //  default error handler
  router.use(function(err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction){
    if(!err.httpCode) {
      console.error(err)
      res.status(500).send(LibraryError(err.message))
      return
    }

    return res.status(err.httpCode).send(err)
  })

  app.use(router)

  return app
}