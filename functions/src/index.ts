import * as dotenv from 'dotenv'
dotenv.config()

import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin'
import { initApp } from './Server/http';
import { MateriController } from './Controller/Materi';

const serviceAccount = require("../credentials.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://e-mudeng.firebaseio.com"
})

const app = initApp()

exports.api = functions.region('asia-east2').https.onRequest(app)

exports.onScoreSet = functions.region('asia-east2').database.ref('submission/{uid}/{idMatkul}/{idMateri}/map/score')
.onUpdate(async (change, context) => {
  // Grab the current value of what was written to the Realtime Database.
  const value = change.after.val()
  await MateriController.getInstance().submitQuizMap(context.params.uid, context.params.idMatkul, context.params.idMateri, value)


  await change.after.ref.parent?.remove()
  return
})
