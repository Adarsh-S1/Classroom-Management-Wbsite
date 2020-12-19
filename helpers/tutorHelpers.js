var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')
const { log } = require('handlebars')
var objectId = require('mongodb').ObjectID

module.exports = {
  doTutorLogin: (tutorData) => {
    let response = {}
    return new Promise(async (resolve, reject) => {
      let tutor = await db.get().collection(collection.TUTOR_COLLECTION).findOne({ Email: tutorData.Email })
      if (tutor) {
        bcrypt.compare(tutorData.Password, tutor.Password).then((status) => {
          if (status) {
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
  addStudent: async (student, callback) => {
    student.Password = await bcrypt.hash(student.Password, 10)
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
            Rollno: studDetails.Rollno,
            Phone: studDetails.Phone,
            Email: studDetails.Email,
            Address: studDetails.Address,
            Username: studDetails.Username
          }
        }).then((response) => {
          resolve()
        })
    })
  },
  deleteStudent: (studId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.STUDENT_COLLECTION).removeOne({ _id: objectId(studId) }).then((response) => {
        resolve(response)
      })
    })
  },
  tutorProfile: (tutor, callback) => {
    db.get().collection(collection.TUTOR_PROFILE_COLLECTION).insertOne(tutor).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  tutorProfileDetails: () => {
    return new Promise(async (resolve, reject) => {
      let teacher = await db.get().collection(collection.TUTOR_PROFILE_COLLECTION).findOne()
      resolve(teacher)
    })
  },
  updateTutDetails: (tutId, tutDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.TUTOR_PROFILE_COLLECTION)
        .updateOne({ _id: objectId(tutId) }, {
          $set: {
            Firstname: tutDetails.Firstname,
            Lastname: tutDetails.Lastname,
            Job: tutDetails.Job,
            Pin: tutDetails.Pin,
            Phone: tutDetails.Phone,
            Email: tutDetails.Email,
            Address: tutDetails.Address,
          }
        }).then((response) => {
          resolve()
        })
    })
  },
  docNotes: async (notes, callback) => {
    db.get().collection(collection.NOTES_DOC_COLLECTION).insertOne(notes).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  vidNotes: async (notes, callback) => {
    db.get().collection(collection.NOTES_VID_COLLECTION).insertOne(notes).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  uvidNotes: async (notes, callback) => {
    db.get().collection(collection.NOTES_U_VID_COLLECTION).insertOne(notes).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  addAssign: (topic) => {

    let assignmentObj = {
      Topic: topic,
      assignments: []
    }
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ASSIGNMENT_COLLECTION).insertOne(assignmentObj).then((response) => {
        resolve(response.ops[0]._id)
      })
    })
  },
  viewAssign: () => {
    return new Promise(async (resolve, reject) => {
      let assign = await db.get().collection(collection.ASSIGNMENT_COLLECTION).find().toArray()
      resolve(assign)
    })
  },
  deleteAssign: (assignId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ASSIGNMENT_COLLECTION).removeOne({ _id: objectId(assignId) }).then((response) => {
        resolve(response)
      })
    })
  },
  getAssignments: (studId) => {
    return new Promise(async (resolve, reject) => {
      let assignments = await db.get().collection(collection.ASSIGNMENT_COLLECTION).aggregate([
        {
          $match: { "assignments.student": objectId(studId) }
        },
        {
          $unwind: '$assignments'
        },
        {
          $project: {
            assignments: "$assignments",
            topic: "$Topic"
          }
        },
        {
          $match: { "assignments.student": objectId(studId) }
        }
      ]).toArray()
      resolve(assignments)
    })
  },
  getstudAttend: (studId) => {
    return new Promise(async (resolve, reject) => {
      let datecheck = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear()
      let attend = await db.get().collection(collection.ATTENDANCE_COLLECTION).aggregate([
        {
          $match: { student: objectId(studId) }
        },
        {
          $unwind: '$attendance'
        },
        {
          $project: {
            attendate: "$attendance.date",
            status: "$attendance.status"
          }
        }
      ]).toArray()
      resolve(attend)
    })
  },
  getAttendance: () => {
    return new Promise(async (resolve, reject) => {
      let datecheck = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear()
      let attend = await db.get().collection(collection.ATTENDANCE_COLLECTION).aggregate([
        {
          $unwind: '$attendance'
        },
        {
          $project: {
            studId: "$student",
            attendate: "$attendance.date",
            status: "$attendance.status"
          }
        },
        {
          $match: { "attendate": datecheck }
        },
        {
          $lookup: {
            from: collection.STUDENT_COLLECTION,
            localField: 'studId',
            foreignField: '_id',
            as: 'student'
          }
        }
      ]).toArray()
      resolve(attend)
    })
  },
  addAnnouncement: async (ext, announce, callback) => {
    let announcement = {
      announcearray: announce,
      extension: ext
    }
    db.get().collection(collection.ANNOUNCEMENT_COLLECTION).insertOne(announcement).then((data) => {
      callback(data.ops[0]._id)
    })
  },
  getAnnouncements: () => {
    return new Promise(async (resolve, reject) => {
      let announcement = await db.get().collection(collection.ANNOUNCEMENT_COLLECTION).find().toArray()
      resolve(announcement)
    })
  }
}

