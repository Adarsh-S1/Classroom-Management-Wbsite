var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID

module.exports = {
  doStudentLogin: (studentDetails) => {
    let response={}
    return new Promise(async (resolve, reject) => {
      let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Username:studentDetails.Username })
      if (student) {
        bcrypt.compare(studentDetails.Password, student.Password).then((status) => {
          if (status) {
            response.student = student
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
     db.get().collection(collection.ASSIGNMENT_COLLECTION).findOne({ _id: objectId(assignId) })
     resolve(response)
    })
  },
  submitAssignment:(assignId,student) => {
    let id=objectId(student)
    let assid=objectId()
        let subassignment={
      student:id,
      assignment:assid
    }
 
    return new Promise((resolve,reject)=>{
      if(db.get().collection(collection.ASSIGNMENT_COLLECTION).findOne({ _id: objectId(assignId) }))
      {
        db.get().collection(collection.ASSIGNMENT_COLLECTION).updateOne({ _id: objectId(assignId) },
         {
           $push:{assignments:subassignment}
         }).then((response)=>{
          resolve(assid)
         })
        }
    })
  },
  
attendhome:(studId)=>{
  return new Promise(async(resolve,reject)=>{
    let datecheck=new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
    let attendObj = {
      date: new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear(),
      status: "Absent"
    }
    let attendDetailObj = {
      student: objectId(studId),
      attendance: [attendObj]
    }
  
    let studattend = await db.get().collection(collection.ATTENDANCE_COLLECTION).findOne({ student: objectId(studId) })
    if(studattend){
      let attendExist = studattend.attendance.findIndex(attendanc => attendanc.date == attendObj.date)
      if(attendExist==-1)
      {
       db.get().collection(collection.ATTENDANCE_COLLECTION).updateOne({student: objectId(studId) },
       {
         $push:{attendance:attendObj}
       }
       ).then((response)=>{
        resolve()
       })
    }
  }else{
      db.get().collection(collection.ATTENDANCE_COLLECTION).insertOne(attendDetailObj).then((response) => {
        resolve()
      })
    }  
    let attend =await db.get().collection(collection.ATTENDANCE_COLLECTION).aggregate([
      {
        $match:{student:objectId(studId)}
      },
      {
        $unwind:'$attendance'
      },
      {
        $project:{
          attendate:"$attendance.date",
          status:"$attendance.status"
        }
      },
      {
        $match:{"attendate":datecheck}
      }
    ]).toArray()
    resolve(attend)
  })  
  },
  attendance: (date,studId) => {
    let datecheck=new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
   return new Promise(async(resolve,reject)=>{
     if(date.Date==datecheck){
    await db.get().collection(collection.ATTENDANCE_COLLECTION).updateOne({ student: objectId(studId), 'attendance.date': datecheck },
    {
      $set: { 'attendance.$.status': "Present" }
    }
    )
  }
    let attend = await db.get().collection(collection.ATTENDANCE_COLLECTION).aggregate([
      {
        $match:{student:objectId(studId)}
      },
      {
        $unwind:'$attendance'
      },
      {
        $project:{
          attendate:"$attendance.date",
          status:"$attendance.status"
        }
      },
      {
        $match:{"attendate":datecheck}
      }
    ]).toArray()
    resolve(attend)
   })    
},
getfullAttendance: (studId) => {
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
    console.log(attend);
    resolve(attend)
  })
},
getAnnounceDetails:(announceId)=>{
  return new Promise(async (resolve, reject) => {
  await db.get().collection(collection.ANNOUNCEMENT_COLLECTION).findOne({_id:objectId(announceId)}).then((response)=>{
    resolve(response)
  })
  })
},
getPhotos: () => {
  return new Promise(async (resolve, reject) => {
    let photo = await db.get().collection(collection.PHOTO_COLLECTION).find().toArray()
    resolve(photo)
  })
}
}
