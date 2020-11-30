var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

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
  },
  addStudent: (student, callback) => {
    db.get().collection('student').insertOne(student).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  getAllStudents: () => {
    return new Promise(async (resolve, reject) => {
      let students = await db.get().collection(collection.STUDENT_COLLECTION).find().toArray()
      resolve(students)
    })
  },
  getStudentDetails: (studId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: objectId(studId) }).then((student) => {
        resolve(student)
      })
    })
  },
  updateStudDetails: (studId, studDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.STUDENT_COLLECTION)
        .updateOne({ _id: objectId(studId) }, {
          $set: {
            Name: studDetails.Name,
            Gender: studDetails.Gender,
            Rollno:studDetails.Rollno,
            Phone:studDetails.Phone,
            Email:studDetails.Email,
            Address:studDetails.Address,
          }
        }).then((response) => {
          resolve()
        })
    })
  }
}
