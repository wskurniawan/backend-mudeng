import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

interface HistoryData {
  idMateri: string
  idMatkul: string
  type: 'quiz' | 'evaluasi'
  title: string
  method: 'sum' | 'video' | 'map' | ''
  score: number
  timestamp: number
  tanggal: string
}

export class UserHistoryModel {
  private static instance: UserHistoryModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('user-history')
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new UserHistoryModel()
    }

    return this.instance
  }

  async getUserRecord(uid: string): Promise<HistoryData[]> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.child(uid).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    if(!snapshot.val()) {
      return []
    }

    return snapshot.val()
  }

  async setUserHistory(uid: string, history: HistoryData[]) {
    try {
      await this.ref.child(`${uid}/${history.length - 1}`).set(history[history.length - 1])
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }
}