import { SoalMaiModel } from "../Model/SoalMai"
import { MaiScore, JawabanMAI, MaiSubmission, MaiSubmissionModel } from "../Model/MaiSubmission"

export interface MaiSubmissionParam {
  jawaban: JawabanMAI[]
}

export class MaiTestController {
  private static __instance: MaiTestController
  private soalMaiModel: SoalMaiModel

  constructor() {
    this.soalMaiModel = SoalMaiModel.getInstance()
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
      scrore: result,
      knowledge: 100,
      requlation: 100
    }

    await MaiSubmissionModel.getInstance().insertResult(uid, submissionResult)

    return submissionResult
  }
}