import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { AccountModel, Account } from "../Model/Account";
import { EmailSudahDigunakan, NimSudahDigunakan, EmailAtauPasswordSalah, SesiTidakValid, DataTidakDitemukan } from "../Error/Error";
import { GetConfig } from '../Config';
import { Pet, PetModel } from '../Model/PetModel';

export interface LoginParam {
  email: string
  password: string
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
  setUserPet(uid: string, petID: string) {
    return this.accountModel.setUserPet(uid, { id: petID })
  }

  // mendapatkan daftar pet yang tersedia
  async getListPet(): Promise<Pet[]> {
    return this.petModel.daftarPet()
  }
}