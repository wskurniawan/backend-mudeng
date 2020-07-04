import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

export interface Account {
  nama: string
  uid: string
  email: string
  nim: string
  password: string
  pet?: AccountPet
  xp?: number
}

export interface AccountPet {
  id: string
}

export type xpEvent = 'pilih-pet' | 'mai-test' | 'foto-profil' | 'masuk-kelas' | 'memilih-materi' | 'memilih-metode-belajar' | 'selesai-materi' | 'selesai-evaluasi' | 'skor-evaluasi'

export class AccountModel {
  private static __instance: AccountModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('user')
  }

  static getInstance(): AccountModel {
    if(!this.__instance) {
      this.__instance = new AccountModel()
    }

    return this.__instance
  }

  async insertUser(data: Account) {
    const userRef = this.ref.push()
    data.uid = userRef.key || ''

    try {
      await userRef.set(data)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }
  
    return
  }

  async getUserByEmail(email: string): Promise<Account | null> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.orderByChild('email').equalTo(email).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    if(!snapshot.val()) {
      return null
    }
    const keys = Object.keys(snapshot.val())

    return snapshot.val()[keys[0]]
  }

  async getUserByNim(nim: string): Promise<Account | null> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.orderByChild('nim').equalTo(nim).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    if(!snapshot.val()) {
      return null
    }
    const keys = Object.keys(snapshot.val())

    return snapshot.val()[keys[0]]
  }

  async updateUser(user: Account) {
    try {
      await this.ref.child(user.uid).update(user)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }

  async getUserByuid(uid: string): Promise<Account | null> {
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

  async setUserPet(uid: string, pet: AccountPet) {
    try {
      await this.ref.child(`${uid}/pet`).set(pet)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }

  async issueXP(uid: string, event: xpEvent, score: number = 0) {
    const account = await this.getUserByuid(uid)

    if(!account) {
      throw DatabaseError('Account not found')
    }

    let currentXP = 0
    if(account.xp) {
      currentXP = account.xp
    }

    if(event === 'pilih-pet') {
      currentXP += 20
    } else if (event === 'mai-test') {
      currentXP += 40
    } else if (event === 'foto-profil') {
      currentXP += 20
    } else if (event === 'masuk-kelas') {
      currentXP += 10
    } else if (event === 'memilih-materi') {
      currentXP += 10
    } else if (event === 'memilih-metode-belajar') {
      currentXP += 20
    } else if (event === 'selesai-materi') {
      currentXP += 40
    } else if (event === 'selesai-evaluasi') {
      currentXP += 40
    } else if (event === 'skor-evaluasi') {
      currentXP += score
    }

    try {
      await this.ref.child(`${uid}/xp`).set(currentXP)
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return
  }
}