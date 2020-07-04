import * as Similiarity from 'string-similarity'
import * as moment from 'moment-timezone'

import { MateriModel, InfoMatkul, TipeMateri, InfoMateri, KontenMateri, UserMateriRecord } from "../Model/MateriModel"
import { Account, AccountModel } from "../Model/Account"
import { UserHistoryModel } from '../Model/UserHistory'

type SoalEvaluasi = { soal: string, pilihan: string }
type APKScore = 'sukses' | 'gagal'

moment.locale('id')

export class MateriController {
  private static instance: MateriController
  private materiModel: MateriModel
  private userModel: AccountModel
  private historyModel: UserHistoryModel

  constructor() {
    this.materiModel = MateriModel.getInstance()
    this.userModel = AccountModel.getInstance()
    this.historyModel = UserHistoryModel.getInstance()
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

  async getMatkul(uid: string, idMatkul: string): Promise<InfoMatkul> {
    await this.userModel.issueXP(uid, 'masuk-kelas')
    return this.materiModel.getMatkul(idMatkul)
  }

  async daftarMateri(uid: string, idMatkul: string): Promise<InfoMateri[]> {
    const arrMateri = await this.materiModel.daftarMateri(idMatkul)
    const userRecord = await this.materiModel.getUserRecord(uid, idMatkul)

    if(userRecord) {
      let recordCounts = 0
      for(const key in userRecord.record) {
        if(userRecord.record[key].evaluasi) {
          if(userRecord.record[key].evaluasi) {
            recordCounts += 1
          } else {
            break
          }
        }
      }
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

  async kontenMateri(uid: string, idMatkul: string, idMateri: string, type: TipeMateri): Promise<KontenMateri[]> {
    await this.userModel.issueXP(uid, 'memilih-materi')
    await this.userModel.issueXP(uid, 'memilih-metode-belajar')
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

  async soalApk(idMatkul: string, idMateri: string): Promise<SoalEvaluasi[]> {
    const arrAPK = await this.materiModel.soalAPK(idMatkul, idMateri)
    const soalAPK: SoalEvaluasi[] = []

    arrAPK.map(item => {
      soalAPK.push({ soal: item.soal, pilihan: item.pilihan })
    })

    return soalAPK
  }

  async submitAPK(user: Account, idMatkul: string, idMateri: string, jawaban: string[]) {
    const arrAPK = await this.materiModel.soalAPK(idMatkul, idMateri)
    let correctCount = 0
    const kunciJawaban: string[] = []
    jawaban.map((item, index) => {
      const normalizedItem = item.toUpperCase()
      if (normalizedItem.match(arrAPK[index].jawaban)) {
        correctCount += 1
      }
      kunciJawaban.push(arrAPK[index].jawaban)
    })

    const score = ((correctCount / arrAPK.length ) * 100).toFixed(0)
    let userRecord = await this.materiModel.getUserRecord(user.uid, idMatkul)
    if(!userRecord) {
      userRecord = {
        nama: user.nama.split(' ')[0],
        record: {
          [idMateri]: {
            apk: parseInt(score)
          }
        },
        total: parseInt(score)
      }
    } else {
      userRecord.record[idMateri] = {
        ...userRecord.record[idMateri],
        apk: parseInt(score)
      }

      userRecord = this.updateUserRecordTotal(userRecord)
    }

    let result: APKScore = 'gagal'
    if(parseInt(score) > 70) {
      result = 'sukses'
    }

    await this.materiModel.setUserRecord(user.uid, idMatkul, userRecord)

    return { jawabanUser: jawaban, kunciJawaban: kunciJawaban, score: parseInt(score), result }
  }

  async submitQuizVideo(user: Account, idMatkul: string, idMateri: string, jawaban: number[]) {
    const soalVideo = await this.materiModel.quizMateri(idMatkul, idMateri, 'video')
    const arrayJawabanUser = soalVideo.map(() => {
      return false
    })
    
    const strJawabanUser: string[] = []
    jawaban.map(item => {
      arrayJawabanUser[item] = true
      strJawabanUser.push(soalVideo[item].keyword)
    })

    let correctCount = 0
    const kunciJawaban: string[] = []
    arrayJawabanUser.map((item, index) => {
      if(item === soalVideo[index].jawaban) {
        correctCount += 1
      }
      
      if(soalVideo[index].jawaban) {
        kunciJawaban.push(soalVideo[index].keyword)
      }
    })

    const score = ((correctCount / soalVideo.length ) * 100).toFixed(0)
    let userRecord = await this.materiModel.getUserRecord(user.uid, idMatkul)
    if(!userRecord) {
      userRecord = {
        nama: user.nama.split(' ')[0],
        record: {
          [idMateri]: {
            quiz: parseInt(score)
          }
        },
        total: parseInt(score)
      }
    } else {
      userRecord.record[idMateri] = {
        ...userRecord.record[idMateri],
        quiz: parseInt(score)
      }

      userRecord = this.updateUserRecordTotal(userRecord)
    }

    await this.materiModel.setUserRecord(user.uid, idMatkul, userRecord)
    await this.generateHistory(user.uid,  idMatkul, idMateri, 'quiz', parseInt(score), 'video')

    return { jawabanUser: strJawabanUser, kunciJawaban: kunciJawaban, score: parseInt(score) }
  }

  async submitQuizSum(user: Account, idMatkul: string, idMateri: string, jawaban: string[]) {
    const soalSum = await this.materiModel.quizMateri(idMatkul, idMateri, 'sum')
    
    const kunciJawaban: string[] = []
    let totalScore = 0
    jawaban.map((item, index) => {
      totalScore += Similiarity.compareTwoStrings(item, soalSum[index].jawaban as string)
      kunciJawaban.push(soalSum[index].jawaban as string)
    })

    const score = ((totalScore / soalSum.length) * 100).toFixed(0)
    let userRecord = await this.materiModel.getUserRecord(user.uid, idMatkul)
    if(!userRecord) {
      userRecord = {
        nama: user.nama.split(' ')[0],
        record: {
          [idMateri]: {
            quiz: parseInt(score)
          }
        },
        total: parseInt(score)
      }
    } else {
      userRecord.record[idMateri] = {
        ...userRecord.record[idMateri],
        quiz: parseInt(score)
      }

      userRecord = this.updateUserRecordTotal(userRecord)
    }

    await this.materiModel.setUserRecord(user.uid, idMatkul, userRecord)
    await this.generateHistory(user.uid,  idMatkul, idMateri, 'quiz', parseInt(score), 'sum')

    return { jawabanUser: jawaban, kunciJawaban: kunciJawaban, score: parseInt(score) }
  }

  async submitQuizMap(uid: string, idMatkul: string, idMateri: string, score: number) {
    const user = await this.userModel.getUserByuid(uid)
    if(!user) {
      return
    }

    let userRecord = await this.materiModel.getUserRecord(uid, idMatkul)
    if(!userRecord) {
      userRecord = {
        nama: user.nama.split(' ')[0],
        record: {
          [idMateri]: {
            quiz: score
          }
        },
        total: score
      }
    } else {
      userRecord.record[idMateri] = {
        ...userRecord.record[idMateri],
        quiz: score
      }

      userRecord = this.updateUserRecordTotal(userRecord)
    }

    await this.materiModel.setUserRecord(user.uid, idMatkul, userRecord)
    await this.generateHistory(user.uid,  idMatkul, idMateri, 'quiz', score, 'map')

    return
  }

  async submitEvaluasi(user: Account, idMatkul: string, idMateri: string, jawaban: string[]) {
    const soalEvaluasi = await this.materiModel.evaluasi(idMatkul, idMateri)
    let correctCount = 0
    const kunciJawaban: string[] = []
    jawaban.map((item, index) => {
      const normalizedItem = item.toUpperCase()
      if (normalizedItem.match(soalEvaluasi[index].jawaban)) {
        correctCount += 1
      }
      kunciJawaban.push(soalEvaluasi[index].jawaban)
    })

    const score = ((correctCount / soalEvaluasi.length ) * 100).toFixed(0)
    let userRecord = await this.materiModel.getUserRecord(user.uid, idMatkul)
    if(!userRecord) {
      userRecord = {
        nama: user.nama.split(' ')[0],
        record: {
          [idMateri]: {
            evaluasi: parseInt(score)
          }
        },
        total: parseInt(score)
      }
    } else {
      userRecord.record[idMateri] = {
        ...userRecord.record[idMateri],
        evaluasi: parseInt(score)
      }

      userRecord = this.updateUserRecordTotal(userRecord)
    }

    let result: APKScore = 'gagal'
    if(parseInt(score) > 70) {
      result = 'sukses'
    }

    await this.materiModel.setUserRecord(user.uid, idMatkul, userRecord)
    await this.generateHistory(user.uid,  idMatkul, idMateri, 'evaluasi', parseInt(score))

    await this.userModel.issueXP(user.uid, 'selesai-materi')
    await this.userModel.issueXP(user.uid, 'selesai-evaluasi')
    await this.userModel.issueXP(user.uid, 'skor-evaluasi', parseInt(score))

    return { jawabanUser: jawaban, kunciJawaban: kunciJawaban, score: parseInt(score), result }
  }

  async getHistory(uid: string) {
    return this.historyModel.getUserRecord(uid)
  }
  
  async getLeaderboard(idMatkul: string) {
    const leaderboard = await this.materiModel.materiLeaderboard(idMatkul)
    leaderboard.sort((a, b) => {
      return b.total - a.total
    })

    return leaderboard
  }

  async getMethodRecomendation(uid: string): Promise<string> {
    const userHistory = await this.historyModel.getUserRecord(uid)

    let method = 'video'
    let highestScore = 0
    userHistory.map(item => {
      if(item.method !== '' && item.score > highestScore) {
        method = item.method
        highestScore = item.score
      }
    })

    return method
  }

  private async generateHistory(uid: string, idMatkul: string, idMateri: string, type: 'quiz' | 'evaluasi', score: number, method?: 'sum' | 'video' | 'map') {
    const materi = await this.materiModel.getMatkul(idMatkul)
    const userHistory = await this.historyModel.getUserRecord(uid)

    userHistory.push({
      idMateri,
      idMatkul,
      type,
      method: method || '',
      score,
      title: `${materi.nama} - ${type.toUpperCase()}`,
      timestamp: Date.now(),
      tanggal: moment().tz('Asia/Jakarta').format('LLLL')
    })

    await this.historyModel.setUserHistory(uid, userHistory)
  }

  private updateUserRecordTotal(userRecord: UserMateriRecord): UserMateriRecord {
    let updateTotal = 0
    for(const key in userRecord.record) {
      const record = userRecord.record[key]
      if(record.apk) {
        updateTotal += record.apk
      }

      if(record.evaluasi) {
        updateTotal += record.evaluasi
      }

      if(record.quiz) {
        updateTotal += record.quiz
      }
    }

    userRecord.total = updateTotal
    return userRecord
  }
}