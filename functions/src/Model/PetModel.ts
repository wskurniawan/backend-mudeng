import * as firebase from 'firebase-admin'
import { DatabaseError } from '../Error/Error'

export interface Pet {
  id: string
  nama: string
  deskripsi: string
  assets: {
    bingung: string
    fighting: string
    main: string
    map: string
    profil: string
    reward: string
    sum: string
    video: string
  }
}

export class PetModel {
  private static instance: PetModel
  private ref: firebase.database.Reference

  constructor() {
    this.ref = firebase.database().ref('daftar-pet')
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new PetModel()
    }

    return this.instance
  }

  async daftarPet(): Promise<Pet[]> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    const val = snapshot.val()
    const keys = Object.keys(val)
    const result: Pet[] = []
    keys.map(item => {
      result.push(val[item])
    })

    return result
  }

  async getPet(id: string): Promise<Pet> {
    let snapshot: firebase.database.DataSnapshot
    try {
      snapshot = await this.ref.child(id).once('value')
    } catch (error) {
      console.error(error)
      throw DatabaseError(error.message)
    }

    return snapshot.val()
  }
}