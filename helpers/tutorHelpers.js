var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')

module.exports = {
  doTutorLogin: (tutorData) => {
    return new Promise(async (resolve, reject) => {
      let tutor = await db.get().collection(collection.TUTOR_COLLECTION).findOne({ Email:tutorData.Email })
      if (tutor) {
        bcrypt.compare(tutorData.Password, tutor.Password).then((status) => {
          if (status) {
            console.log("----------------------------Success---------------------");
            response.tutor = tutor
            response.status = true
            resolve(response)
          } else {
            resolve({ status: false })
          }

        })
      } else {
        resolve({ status: false })
      }
    })
  }
}
