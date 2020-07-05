import * as joi from '@hapi/joi'
import { Request, Response, NextFunction } from 'express'
import * as firebase from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'

import { MateriController } from '../../Controller/Materi'
import { TipeMateri } from '../../Model/MateriModel'
import { ValidationError, LibraryError } from '../../Error/Error'

export async function getDaftarMatkulHandler(req: Request, res: Response, next: NextFunction) {
  let daftarMatkul  
  try {
    daftarMatkul = await MateriController.getInstance().daftarMatkul()
  } catch (error) {
    next(error)
    return
  }

  res.send(daftarMatkul)
}

export async function getMatkulHandler(req: Request, res: Response, next: NextFunction) {
  let matkul
  try {
    matkul = await MateriController.getInstance().getMatkul(req.user.uid, req.params.idMatkul)
  } catch (error) {
    next(error)
    return
  }

  res.send(matkul)
}

export async function getDaftarMateriHandler(req: Request, res: Response, next: NextFunction) {
  let daftarMateri
  try {
    daftarMateri = await MateriController.getInstance().daftarMateri(req.user.uid, req.params.idMatkul)
  } catch (error) {
    next(error)
    return
  }

  res.send(daftarMateri)
}

export async function getKontenMateriHandler(req: Request, res: Response, next: NextFunction) {
  let materi
  try {
    materi = await MateriController.getInstance().kontenMateri(req.user.uid, req.params.idMatkul, req.params.idMateri, req.params.tipeMateri as TipeMateri)
  } catch (error) {
    next(error)
    return
  }

  return res.send(materi)
}

export async function getQuizMateriHandler(req: Request, res: Response, next: NextFunction) {
  let quiz
  try {
    quiz = await MateriController.getInstance().quizMateri(req.params.idMatkul, req.params.idMateri, req.params.tipeMateri as TipeMateri)
  } catch (error) {
    next(error)
    return
  }

  return res.send(quiz)
}

export async function getEvaluasiMateriHandler(req: Request, res: Response, next: NextFunction) {
  let evaluasi
  try {
    evaluasi = await MateriController.getInstance().evaluasi(req.params.idMatkul, req.params.idMateri)
  } catch (error) {
    next(error)
    return
  }

  return res.send(evaluasi)
}

export async function getSoalAPKHandler(req: Request, res: Response, next: NextFunction) {
  let soalApk
  try {
    soalApk = await MateriController.getInstance().soalApk(req.params.idMatkul, req.params.idMateri)
  } catch (error) {
    next(error)
    return
  }

  return res.send(soalApk)
}

export async function submitAPKHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    jawaban: joi.array().items(joi.string()).required(),
    idMatkul: joi.string().required(),
    idMateri: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    console.error(error)
    next(ValidationError(error.message))
    return
  }

  let result
  try {
    result = await MateriController.getInstance().submitAPK(req.user, req.body.idMatkul, req.body.idMateri, req.body.jawaban)
  } catch (error) {
    next(error)
    return
  }

  return res.send(result)
}

export async function submitQuizSumHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    jawaban: joi.array().items(joi.string()).required(),
    idMatkul: joi.string().required(),
    idMateri: joi.string().required(),
    selected: joi.array().items(joi.number()).required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    console.error(error)
    next(ValidationError(error.message))
    return
  }

  let result
  try {
    result = await MateriController.getInstance().submitQuizSum(req.user, req.body.idMatkul, req.body.idMateri, req.body.jawaban, req.body.selected)
  } catch (error) {
    next(error)
    return
  }

  return res.send(result)
}

export async function submitQuizVideoHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    jawaban: joi.array().items(joi.number()).required(),
    idMatkul: joi.string().required(),
    idMateri: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    console.error(error)
    next(ValidationError(error.message))
    return
  }

  let result
  try {
    result = await MateriController.getInstance().submitQuizVideo(req.user, req.body.idMatkul, req.body.idMateri, req.body.jawaban)
  } catch (error) {
    next(error)
    return
  }

  return res.send(result)
}

export async function submitQuizMapHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    idMatkul: joi.string().required(),
    idMateri: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    console.error(error)
    next(ValidationError(error.message))
    return
  }

  const files = req.files as {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    filepath: string
  }[]

  const destination = path.join(`submission/${req.user.uid}/${req.body.idMatkul}/${req.body.idMateri}/${files[0].originalname}`)
  let mediaLink = ''
  try {
    await firebase.storage().bucket('e-mudeng.appspot.com').upload(files[0].filepath, {
      destination: destination,
      metadata: {
        contentType: files[0].mimetype
      }
    })

    //const result = await firebase.storage().bucket('e-mudeng.appspot.com').file(destination).getSignedUrl({ action: 'read', expires: Date.now() + 604800 * 1000 })
    await firebase.storage().bucket('e-mudeng.appspot.com').file(destination).makePublic()
    const result = await firebase.storage().bucket('e-mudeng.appspot.com').file(destination).getMetadata() as any[]
    mediaLink = result[0].mediaLink
    fs.unlinkSync(files[0].filepath)

    await firebase.database().ref(`submission/${req.user.uid}/${req.body.idMatkul}/${req.body.idMateri}/map`).set({
      url: mediaLink,
      score: 0
    })
  } catch (error) {
    console.error(error)
    next(LibraryError(error.message))
    return
  }

  return res.send({ status: 200 })
}

export async function submitEvaluasiHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    jawaban: joi.array().items(joi.string()).required(),
    idMatkul: joi.string().required(),
    idMateri: joi.string().required()
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    console.error(error)
    next(ValidationError(error.message))
    return
  }

  let result
  try {
    result = await MateriController.getInstance().submitEvaluasi(req.user, req.body.idMatkul, req.body.idMateri, req.body.jawaban)
  } catch (error) {
    next(error)
    return
  }

  return res.send(result)
}

export async function getHistoryHandler(req: Request, res: Response, next: NextFunction) {
  let history
  try {
    history = await MateriController.getInstance().getHistory(req.user.uid)
  } catch (error) {
    next(error)
    return
  }  

  res.send(history)
}

export async function getLeaderBoardHanlder(req: Request, res: Response, next: NextFunction) {
  let leaderboard
  try {
    leaderboard = await MateriController.getInstance().getLeaderboard(req.params.idMatkul)
  } catch (error) {
    next(error)
    return
  }  

  res.send(leaderboard)
}

export async function getMethodRecomendationHandler(req: Request, res: Response, next: NextFunction) {
  let recomendation
  try {
    recomendation = await MateriController.getInstance().getMethodRecomendation(req.user.uid)
  } catch (error) {
    next(error)
    return
  }

  res.send({ method: recomendation})
}