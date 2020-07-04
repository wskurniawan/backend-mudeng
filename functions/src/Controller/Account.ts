import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { AccountModel, Account } from "../Model/Account";
import { EmailSudahDigunakan, NimSudahDigunakan, EmailAtauPasswordSalah, SesiTidakValid, DataTidakDitemukan, DatabaseError } from "../Error/Error";
import { GetConfig } from '../Config';
import { Pet, PetModel } from '../Model/PetModel';

export interface LoginParam {
  email: string
  password: string
}

export interface CommonProfile {
  nama: string
  level: number,
  progress: number
}

export class AccountController {
  private static __instance: AccountController
  private accountModel: AccountModel
  private petModel: PetModel

  constructor() {
    this.accountModel = AccountModel.getInstance()
    this.petModel = PetModel.getInstance()
  }

  static getInstance() {
    if(!this.__instance) {
      this.__instance = new AccountController()
    }

    return this.__instance
  }

  // pendaftaran
  async signup(data: Account) {
    const emailExist = await this.accountModel.getUserByEmail(data.email)
    if(emailExist) {
      throw EmailSudahDigunakan
    }

    const nimExist = await this.accountModel.getUserByNim(data.nim)
    if(nimExist) {
      throw NimSudahDigunakan
    }

    data.password = await bcrypt.hash(data.password, 10)

    await this.accountModel.insertUser(data)
    return
  }

  // login
  async signin(data: LoginParam): Promise<string> {
    const account = await this.accountModel.getUserByEmail(data.email)

    if(!account) {
      throw EmailAtauPasswordSalah
    }

    const validation = await bcrypt.compare(data.password, account.password)
    if(!validation) {
      throw EmailAtauPasswordSalah
    }

    const token = this.generateToken(account.uid)
    return token
  }

  // membuat token autentikasi
  private generateToken(uid: string): string {
    return jwt.sign({ uid, exp: Date.now() + ( 2 * 24 * 3600 * 1000 )}, GetConfig().AuthSecret)
  }

  // validasi token autentikasi
  async validateToken(token: string): Promise<Account> {
    let payload: { uid: string, exp: number }
    try {
      payload = jwt.verify(token, GetConfig().AuthSecret) as any
    } catch (error) {
      throw SesiTidakValid
    }

    const user = await this.accountModel.getUserByuid(payload.uid)

    if(!user) {
      throw SesiTidakValid
    }

    return user
  }

  // mendapatkan pet pilihan pengguna
  async getUserPet(uid: string): Promise<Pet | null> {
    const account = await this.accountModel.getUserByuid(uid)
    if(!account) {
      throw DataTidakDitemukan('Akun')
    }

    if(!account.pet) {
      return null
    }

    const pet = await this.petModel.getPet(account.pet.id)
    return pet
  }

  // melakukan set pet pengguna seusai pilihan
  async setUserPet(uid: string, petID: string) {
    await this.accountModel.issueXP(uid, 'pilih-pet')
    return this.accountModel.setUserPet(uid, { id: petID })
  }

  // mendapatkan daftar pet yang tersedia
  async getListPet(): Promise<Pet[]> {
    return this.petModel.daftarPet()
  }

  async getCommonProfile(uid: string): Promise<CommonProfile> {
    const user = await this.accountModel.getUserByuid(uid)

    if(!user) {
      throw DatabaseError('Account not found')
    }

    const commonProfile: CommonProfile = {
      nama: user.nama,
      level: 1,
      progress: 0
    }

    if(!user.xp) {
      return commonProfile
    }

    let level = 1
    let progress = 0
    if(user.xp >= 1300) {
      level = 28
      progress = 100
    } else if(user.xp >= 1100) {
      level = 27
      progress = parseInt(((user.xp - 1100) * 100 / 200).toFixed(0))
    } else if(user.xp >= 900) {
      level = 26
      progress = parseInt(((user.xp - 900) * 100 / 200).toFixed(0))
    } else if(user.xp >= 820) {
      level = 25
      progress = parseInt(((user.xp - 820) * 100 / 180).toFixed(0))
    } else if(user.xp >= 730) {
      level = 24
      progress = parseInt(((user.xp - 730) * 100 / 90).toFixed(0))
    } else if(user.xp >= 670) {
      level = 23
      progress = parseInt(((user.xp - 670) * 100 / 60).toFixed(0))
    } else if(user.xp >= 600) {
      level = 22
      progress = parseInt(((user.xp - 600) * 100 / 70).toFixed(0))
    } else if(user.xp >= 560) {
      level = 21
      progress = parseInt(((user.xp - 560) * 100 / 40).toFixed(0))
    } else if(user.xp >= 500) {
      level = 20
      progress = parseInt(((user.xp - 500) * 100 / 60).toFixed(0))
    } else if(user.xp >= 470) {
      level = 19
      progress = parseInt(((user.xp - 470) * 100 / 30).toFixed(0))
    } else if(user.xp >= 450) {
      level = 18
      progress = parseInt(((user.xp - 450) * 100 / 20).toFixed(0))
    } else if(user.xp >= 420) {
      level = 17
      progress = parseInt(((user.xp - 420) * 100 / 30).toFixed(0))
    } else if(user.xp >= 390) {
      level = 16
      progress = parseInt(((user.xp - 390) * 100 / 30).toFixed(0))
    } else if(user.xp >= 365) {
      level = 15
      progress = parseInt(((user.xp - 365) * 100 / 25).toFixed(0))
    } else if(user.xp >= 340) {
      level = 14
      progress = parseInt(((user.xp - 340) * 100 / 25).toFixed(0))
    } else if(user.xp >= 300) {
      level = 13
      progress = parseInt(((user.xp - 300) * 100 / 40).toFixed(0))
    } else if(user.xp >= 270) {
      level = 12
      progress = parseInt(((user.xp - 270) * 100 / 30).toFixed(0))
    } else if(user.xp >= 250) {
      level = 11
      progress = parseInt(((user.xp - 250) * 100 / 20).toFixed(0))
    } else if(user.xp >= 220) {
      level = 10
      progress = parseInt(((user.xp - 220) * 100 / 30).toFixed(0))
    } else if(user.xp >= 195) {
      level = 9
      progress = parseInt(((user.xp - 195) * 100 / 25).toFixed(0))
    } else if(user.xp >= 170) {
      level = 8
      progress = parseInt(((user.xp - 170) * 100 / 25).toFixed(0))
    } else if(user.xp >= 160) {
      level = 7
      progress = parseInt(((user.xp - 160) * 100 / 10).toFixed(0))
    } else if(user.xp >= 140) {
      level = 6
      progress = parseInt(((user.xp - 140) * 100 / 20).toFixed(0))
    } else if(user.xp >= 130) {
      level = 5
      progress = parseInt(((user.xp - 130) * 100 / 10).toFixed(0))
    } else if(user.xp >= 105) {
      level = 4
      progress = parseInt(((user.xp - 105) * 100 / 25).toFixed(0))
    } else if(user.xp >= 80) {
      level = 3
      progress = parseInt(((user.xp - 80) * 100 / 25).toFixed(0))
    } else if(user.xp >= 60) {
      level = 2
      progress = parseInt(((user.xp - 60) * 100 / 20).toFixed(0))
    } else {
      progress = parseInt((user.xp * 100 / 60).toFixed(0))
    }
    
    commonProfile.progress = progress
    commonProfile.level = level
    return commonProfile
  }
}