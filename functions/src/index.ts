import * as dotenv from 'dotenv'
dotenv.config()

import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin'
import { initApp } from './Server/http';

const serviceAccount = require("../credentials.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://e-mudeng.firebaseio.com"
})

const app = initApp()

exports.api = functions.region('asia-east2').https.onRequest(app)
