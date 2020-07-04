import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as morgan from 'morgan'
import * as cors from 'cors'

import { Account } from "../Model/Account";
import { signupHandler, signinHandler, getAccountPetHandler, setAccountPetHandler, getAvailablePetHandler, getCommonProfileHandler } from './Handler/Account';
import { sessionValidatorMiddleware } from './Middleware/Session';
import { getSoalHandler, nilaiMaiHandler, getHasilMaiHandler } from './Handler/MaiTest';
import { CustomError, LibraryError } from '../Error/Error';
import { getMethodRecomendationHandler, getDaftarMateriHandler, getMatkulHandler, getKontenMateriHandler, getQuizMateriHandler, getEvaluasiMateriHandler, getDaftarMatkulHandler, getSoalAPKHandler, submitAPKHandler, submitQuizSumHandler, submitQuizVideoHandler, submitQuizMapHandler, submitEvaluasiHandler, getLeaderBoardHanlder, getHistoryHandler } from './Handler/Materi'
import { filesUpload } from './Middleware/FileUpload'

declare global {
  namespace Express {
    interface Request {
      user: Account
      files?: any
      rawBody?: any
    }
  }
}

export function initApp(): express.Express {
  const app = express()

  app.use(cors({ credentials: true, origin: true }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(morgan('combined'))

  const router = express.Router()

  router.post('/signup', signupHandler)
  router.post('/signin', signinHandler)

  router.get('/pet', sessionValidatorMiddleware, getAvailablePetHandler)
  router.get('/profile/pet', sessionValidatorMiddleware, getAccountPetHandler)
  router.post('/profile/pet', sessionValidatorMiddleware, setAccountPetHandler)

  router.get('/profile/common-profile', sessionValidatorMiddleware, getCommonProfileHandler)
  router.get('/profile/history', sessionValidatorMiddleware, getHistoryHandler)

  router.get('/mai/soal', sessionValidatorMiddleware, getSoalHandler)
  router.post('/mai/submit', sessionValidatorMiddleware, nilaiMaiHandler)
  router.get('/mai/result', sessionValidatorMiddleware, getHasilMaiHandler)

  router.get('/matkul/daftar', sessionValidatorMiddleware, getDaftarMatkulHandler)
  router.get('/matkul/:idMatkul', sessionValidatorMiddleware, getMatkulHandler)
  router.get('/matkul/:idMatkul/materi', sessionValidatorMiddleware, getDaftarMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/konten/:tipeMateri', sessionValidatorMiddleware, getKontenMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/quiz/:tipeMateri', sessionValidatorMiddleware, getQuizMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/evaluasi', sessionValidatorMiddleware, getEvaluasiMateriHandler)
  router.get('/matkul/:idMatkul/materi/:idMateri/apk', sessionValidatorMiddleware, getSoalAPKHandler)

  router.post('/matkul/apk/submit', sessionValidatorMiddleware, submitAPKHandler)
  router.post('/matkul/quiz/sum', sessionValidatorMiddleware, submitQuizSumHandler)
  router.post('/matkul/quiz/video', sessionValidatorMiddleware, submitQuizVideoHandler)
  router.post('/matkul/quiz/map', sessionValidatorMiddleware, filesUpload, submitQuizMapHandler)
  router.post('/matkul/evaluasi', sessionValidatorMiddleware, submitEvaluasiHandler)

  router.get('/matkul/:idMatkul/leaderboard', sessionValidatorMiddleware, getLeaderBoardHanlder)
  router.get('/matkul/method/recomendation', sessionValidatorMiddleware, getMethodRecomendationHandler)

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