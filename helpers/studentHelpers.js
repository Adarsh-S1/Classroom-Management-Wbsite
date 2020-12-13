var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

module.exports = {
  doStudentLogin: (studentDetails) => {
    let response={}
    return new Promise(async (resolve, reject) => {
      let student= await db.get().collection(collection.STUDENT_COLLECTION).findOne({"student.Username":studentDetails.Username})
      console.log(student);
      if (student) {
        bcrypt.compare(studentDetails.Password, student.student.Password).then((status) => {
          if (status) {
            response.student = student
            response.status = true
            console.log(response.student,"-------------------------");
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
  phoneNoCheck: (studentDetails) => {
    return new Promise(async (resolve, reject) => {
      let response={}
      let status
      let phone = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Phone:studentDetails.Phone })
      if(phone){
        response.phone = phone
        response.status=true
           resolve(response)
          }else{
           status=false
          }
          resolve(status)
        })
  },
  OtpCheck: (studentDetails) => {
    return new Promise(async (resolve, reject) => {
          resolve(studentDetails.otp)
        })
  },
  Notes: () => {
    return new Promise(async (resolve, reject) => {
      let doc = await db.get().collection(collection.NOTES_DOC_COLLECTION).find().toArray()
      resolve(doc)
    })
  },
  videoNotes: () => {
    return new Promise(async (resolve, reject) => {
      let video = await db.get().collection(collection.NOTES_VID_COLLECTION).find().toArray()
      resolve(video)
    })
  },
  utubeNotes: () => {
    return new Promise(async (resolve, reject) => {
      let uvideo = await db.get().collection(collection.NOTES_U_VID_COLLECTION).find().toArray()
      resolve(uvideo)
    })
  },
  viewAssign: () => {
    return new Promise(async (resolve, reject) => {
      let assign = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find().toArray()
      resolve(assign)
    })
  },
  subAssign: (assignId) => {
    return new Promise((resolve, reject) => {
     db.get().collection(collection.ASSIGNMENT_COLLECTION).findOne({ _id: objectId(assignId) }).then((response)=>{
      resolve(response)
     })
    })
  },
  submitAssignment:(studId,assignId,stuassign) => {
    let id=objectId(stuassign)
    return new Promise((resolve,reject)=>{
      if(db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: objectId(studId) }))
      {
        db.get().collection(collection.STUDENT_COLLECTION).updateOne({ _id: objectId(studId) },
         {
           $push:{topic:objectId(assignId),assignments:id}         
         }).then((response)=>{
          resolve(id)
         })
        }
    })
  }
}

