import { SoalMaiModel } from "../Model/SoalMai"
import { MaiScore, JawabanMAI, MaiSubmission, MaiSubmissionModel } from "../Model/MaiSubmission"
import { AccountModel } from "../Model/Account"

export interface MaiSubmissionParam {
  jawaban: JawabanMAI[]
}

export class MaiTestController {
  private static __instance: MaiTestController
  private soalMaiModel: SoalMaiModel
  private maiSubmissionModel: MaiSubmissionModel
  private accountModel: AccountModel

  constructor() {
    this.soalMaiModel = SoalMaiModel.getInstance()
    this.maiSubmissionModel = MaiSubmissionModel.getInstance()
    this.accountModel = AccountModel.getInstance()
  }

  static getInstance() {
    if(!this.__instance){
      this.__instance = new MaiTestController()
    }

    return this.__instance
  }

  //mendapatkan soal MAI
  getSoal() {
    return this.soalMaiModel.getSoal()
  }

  //melakukan scoring
  async penilaianMai(uid: string, submission: MaiSubmissionParam): Promise<MaiSubmission> {
    let score = 0
    const jawaban: JawabanMAI[] = []
    for(const item of submission.jawaban) {
      if(item === 'sering' || item === 'selalu') {
        score += 1
      }
      jawaban.push(item)
    }
    let result: MaiScore = 'low'
    if(score < 20) {
      result = 'low'
    } else if (score < 35) {
      result = 'medium'
    } else {
      result = 'high'
    }

    const submissionResult: MaiSubmission = {
      jawaban: jawaban,
      score: result,
      knowledge: 100,
      requlation: 100
    }

    await this.maiSubmissionModel.insertResult(uid, submissionResult)
    await this.accountModel.issueXP(uid, 'mai-test')

    return submissionResult
  }

  async getMaiResult(uid: string) {
    return this.maiSubmissionModel.getMaiResult(uid)
  }
}