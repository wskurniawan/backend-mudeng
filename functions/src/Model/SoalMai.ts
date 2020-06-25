import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

interface SoalMai {
  id: number
  question: string
}

export class SoalMaiModel {
  private static __instance: SoalMaiModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('mai-test')
  }

  static getInstance(): SoalMaiModel {
    if(!this.__instance) {
      this.__instance = new SoalMaiModel()
    }

    return this.__instance
  }

  async getSoal(): Promise<SoalMai[]> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }
}