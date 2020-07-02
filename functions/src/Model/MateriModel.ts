import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

export interface InfoMatkul {
  id: string
  dosen: string
  kode: string
  nama: string
  rpkps: string
  semester: string
  sks: number
}

export interface UserMateriRecord {
  nama: string
  record: {
    [idMateri: string]: number
  }
  total: number
}

export interface InfoMateri {
  id: string
  judul: string
  deskripsi: string
  icon: {
    enabled: string
    disabled: string
  }
  isEligable?: number
}

export interface KontenMateri {
  judul: string
  thumbnail?: string
  url: string
}

export interface QuizMateri {
  keyword: string
  jawaban: string | boolean
}

export type TipeMateri = 'video' | 'sum' | 'map'

export interface SoalEvaluasi {
  jawaban: string
  pilihan: string
  soal: string
}

export class MateriModel {
  private static instance: MateriModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('mata-kuliah')
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new MateriModel()
    }

    return this.instance
  }

  async daftarMatkul(): Promise<InfoMatkul[]> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    const materiObj = snapshot.val()
    console.log(materiObj)
    const arrMateri = Object.values(materiObj)
    const arrInfoMateri: InfoMatkul[] = []

    arrMateri.map((item: any) => {
      arrInfoMateri.push(item.info)
    })

    return arrInfoMateri
  }

  async setUserRecord(uid: string, record: UserMateriRecord) {
    const leaderBoardRef = this.ref.child('leaderboard')
    try {
      await leaderBoardRef.child(uid).set(record)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }

  async getUserRecord(uid: string): Promise<UserMateriRecord | null> {
    const leaderBoardRef = this.ref.child('leaderboard')
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await leaderBoardRef.child(uid).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    if(!snapshot.val()) {
      return null
    }

    return snapshot.val()
  }

  async getMatkul(idMatkul: string): Promise<InfoMatkul> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.child(`${idMatkul}/info`).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }

  async daftarMateri(idMatkul: string): Promise<InfoMateri[]> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.child(`${idMatkul}/materi`).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    const arrMateri = Object.values(snapshot.val())
    const arrInfoMateri: InfoMateri[] = []
    arrMateri.map((item: any) => {
      arrInfoMateri.push({ id: item.id, judul: item.judul, deskripsi: item.deskripsi, icon: item.icon })
    })

    return arrInfoMateri
  }

  async kontenMateri(idMatkul: string, idMateri: string, type: TipeMateri): Promise<KontenMateri[]> {
    const refMateri = this.ref.child(`${idMatkul}/materi/${idMateri}/${type}`)

    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await refMateri.once('value')
    } catch (error) {
      console.error(error.message)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }

  async quizMateri(idMatkul: string, idMateri: string, type: TipeMateri): Promise<QuizMateri[]> {
    const refQuiz = this.ref.child(`${idMatkul}/materi/${idMateri}/quiz-${type}`)

    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await refQuiz.once('value')
    } catch (error) {
      console.error(error.message)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }

  async evaluasi(idMatkul: string, idMateri: string): Promise<SoalEvaluasi[]> {
    const refEvaluasi = this.ref.child(`${idMatkul}/materi/${idMateri}/evaluasi`)

    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await refEvaluasi.once('value')
    } catch (error) {
      console.error(error.message)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }
}