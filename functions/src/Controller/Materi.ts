import { MateriModel, InfoMatkul, UserMateriRecord, TipeMateri, InfoMateri, KontenMateri } from "../Model/MateriModel"

type SoalEvaluasi = { soal: string, pilihan: string }

export class MateriController {
  private static instance: MateriController
  private materiModel: MateriModel

  constructor() {
    this.materiModel = MateriModel.getInstance()
  }

  static getInstance() {
    if(!this.instance) {
      this.instance = new MateriController()
    }

    return this.instance
  }

  async daftarMatkul(): Promise<InfoMatkul[]> {
    return this.materiModel.daftarMatkul()
  }

  async setUserRecord(uid: string, data: UserMateriRecord) {
    const currentRecord = await this.materiModel.getUserRecord(uid)
    if(currentRecord) {
      for(const key in data.record) {
        currentRecord.record = {
          ...currentRecord.record,
          [key]: data.record[key]
        }
      }

      await this.materiModel.setUserRecord(uid, currentRecord)
      return
    }

    await this.materiModel.setUserRecord(uid, data)
    return
  }

  async getUserRecord(uid: string): Promise<UserMateriRecord | null> {
    return this.materiModel.getUserRecord(uid)
  }

  async getMatkul(idMatkul: string): Promise<InfoMatkul> {
    return this.materiModel.getMatkul(idMatkul)
  }

  async daftarMateri(uid: string, idMatkul: string): Promise<InfoMateri[]> {
    const arrMateri = await this.materiModel.daftarMateri(idMatkul)
    const userRecord = await this.materiModel.getUserRecord(uid)

    if(userRecord) {
      const recordCounts = Object.keys(userRecord.record).length
      arrMateri.map((item, index) => {
        if(index <= recordCounts) {
          item.isEligable = 1
        } else if (index === recordCounts + 1) {
          item.isEligable = 2
        } else {
          item.isEligable = 3
        }
      })
    } else {
      arrMateri.map((item, index) => {
        if(index <= 0) {
          item.isEligable = 1
        } else if (index === 1) {
          item.isEligable = 2
        } else {
          item.isEligable = 3
        }
      })
    }

    return arrMateri
  }

  async kontenMateri(idMatkul: string, idMateri: string, type: TipeMateri): Promise<KontenMateri[]> {
    return this.materiModel.kontenMateri(idMatkul, idMateri, type)
  }

  async quizMateri(idMatkul: string, idMateri: string, type: TipeMateri): Promise<string[]> {
    const quiz = await this.materiModel.quizMateri(idMatkul, idMateri, type)
    const keyword: string[] = []
    quiz.map(item => {
      keyword.push(item.keyword)
    })

    return keyword
  }

  async evaluasi(idMatkul: string, idMateri: string): Promise<SoalEvaluasi[]> {
    const arrEvaluasi = await this.materiModel.evaluasi(idMatkul, idMateri)
    const soalEvaluasi: SoalEvaluasi[] = []

    arrEvaluasi.map(item => {
      soalEvaluasi.push({ soal: item.soal, pilihan: item.pilihan })
    })

    return soalEvaluasi
  }
}