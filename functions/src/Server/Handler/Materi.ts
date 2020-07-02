import { Request, Response, NextFunction } from 'express'
import { MateriController } from '../../Controller/Materi'
import { TipeMateri } from '../../Model/MateriModel'

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
    matkul = await MateriController.getInstance().getMatkul(req.params.idMatkul)
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
    materi = await MateriController.getInstance().kontenMateri(req.params.idMatkul, req.params.idMateri, req.params.tipeMateri as TipeMateri)
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