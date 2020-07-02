import * as joi from '@hapi/joi'

import { Request, Response, NextFunction } from 'express'
import { MaiTestController } from '../../Controller/MaiTest'

export async function getSoalHandler(req: Request, res: Response, next: NextFunction) {
  let soal
  try {
    soal = await MaiTestController.getInstance().getSoal()
  } catch (error) {
    next(error)
    return
  }

  return res.send(soal)
}

export async function nilaiMaiHandler(req: Request, res: Response, next: NextFunction) {
  const schema = joi.object().keys({
    jawaban: joi.array().items(joi.string())
  })

  try {
    await schema.validateAsync(req.body)
  } catch (error) {
    next(error)
    return
  }

  let result
  try {
    result = await MaiTestController.getInstance().penilaianMai(req.user.uid, req.body)
  } catch (error) {
    next(error)
    return
  }

  return res.send(result)
}

export async function getHasilMaiHandler(req: Request, res: Response, next: NextFunction) {
  let hasilMai
  try {
    hasilMai = await MaiTestController.getInstance().getMaiResult(req.user.uid)
  } catch (error) {
    next(error)
    return
  }

  res.send(hasilMai)
}