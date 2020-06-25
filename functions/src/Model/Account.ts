import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

export interface Account {
  uid: string
  email: string
  nim: string
  password: string
  pet?: AccountPet
}

export interface AccountPet {
  id: string
}

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
}