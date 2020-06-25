import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

export interface MaiSubmission {
  jawaban: JawabanMAI[]
  scrore: MaiScore
  knowledge: number
  requlation: number
}

export type JawabanMAI = 'tidak-pernah' | 'jarang' | 'kadang-kadang' | 'sering' | 'selalu'
export type MaiScore = 'high' | 'medium' | 'low'

export class MaiSubmissionModel {
  private static instance: MaiSubmissionModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('mai-result')
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new MaiSubmissionModel()
    }

    return this.instance
  }

  async insertResult(uid: string, data: MaiSubmission) {
    try {
      await this.ref.child(uid).set(data)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }

  async getMaiResult(uid: string): Promise<MaiSubmission | null> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.child(uid).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    if(!snapshot.val()) {
      return null
    }
    
    return snapshot.val()
  }
}