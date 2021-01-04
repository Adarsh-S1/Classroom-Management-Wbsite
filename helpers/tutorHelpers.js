var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("express");
const bcrypt = require("bcrypt");
const { log } = require("handlebars");
var objectId = require("mongodb").ObjectID;

module.exports = {
  tutorRegister: (tutor) => {
    return new Promise(async (resolve, reject) => {
      tutor.Password = await bcrypt.hash(tutor.Password, 10);
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .insertOne(tutor)
        .then((tutor) => {
          resolve(tutor);
        });
    });
  },
  tutorCheck: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ Status: "inserted" })
        .then((response) => {
          resolve(response);
        });
    });
  },
  doTutorLogin: (tutorData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let tutor = await db
        .get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne({ Email: tutorData.Email });
      if (tutor) {
        bcrypt.compare(tutorData.Password, tutor.Password).then((status) => {
          if (status) {
            response.tutor = tutor;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  addStudent: async (student, callback) => {
    student.Rollno = parseInt(student.Rollno);
    student.Password = await bcrypt.hash(student.Password, 10);
    db.get()
      .collection("student")
      .insertOne(student)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getAllStudents: () => {
    return new Promise(async (resolve, reject) => {
      let students = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .find()
        .sort({ Rollno: 1 })
        .toArray();
      resolve(students);
    });
  },
  getStudentDetails: (studId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: objectId(studId) })
        .then((student) => {
          resolve(student);
        });
    });
  },
  updateStudDetails: (studId, studDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .updateOne(
          { _id: objectId(studId) },
          {
            $set: {
              Name: studDetails.Name,
              Gender: studDetails.Gender,
              Rollno: parseInt(studDetails.Rollno),
              Phone: studDetails.Phone,
              Email: studDetails.Email,
              Address: studDetails.Address,
              Username: studDetails.Username,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  deleteStudent: (studId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .removeOne({ student: objectId(studId) });
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .removeOne({ _id: objectId(studId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  tutorProfile: (tutor, callback) => {
    db.get()
      .collection(collection.TUTOR_COLLECTION)
      .insertOne(tutor)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  tutorProfileDetails: () => {
    return new Promise(async (resolve, reject) => {
      let teacher = await db
        .get()
        .collection(collection.TUTOR_COLLECTION)
        .findOne();
      resolve(teacher);
    });
  },
  updateTutDetails: (tutId, tutDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.TUTOR_COLLECTION)
        .updateOne(
          { _id: objectId(tutId) },
          {
            $set: {
              Firstname: tutDetails.Firstname,
              Lastname: tutDetails.Lastname,
              Job: tutDetails.Job,
              Pin: tutDetails.Pin,
              Phone: tutDetails.Phone,
              Email: tutDetails.Email,
              Address: tutDetails.Address,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  docNotes: async (notes, callback) => {
    db.get()
      .collection(collection.NOTES_DOC_COLLECTION)
      .insertOne(notes)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  vidNotes: async (notes, callback) => {
    db.get()
      .collection(collection.NOTES_VID_COLLECTION)
      .insertOne(notes)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  uvidNotes: async (notes, callback) => {
    db.get()
      .collection(collection.NOTES_U_VID_COLLECTION)
      .insertOne(notes)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  addAssign: (topic) => {
    let assignmentObj = {
      Topic: topic,
      assignments: [],
    };
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .insertOne(assignmentObj)
        .then((response) => {
          resolve(response.ops[0]._id);
        });
    });
  },
  viewAssign: () => {
    return new Promise(async (resolve, reject) => {
      let assign = await db
        .get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(assign);
    });
  },
  deleteAssign: (assignId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .removeOne({ _id: objectId(assignId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAssignments: (studId) => {
    return new Promise(async (resolve, reject) => {
      let assignments = await db
        .get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .aggregate([
          {
            $match: { "assignments.student": objectId(studId) },
          },
          {
            $unwind: "$assignments",
          },
          {
            $project: {
              assignments: "$assignments",
              topic: "$Topic",
            },
          },
          {
            $match: { "assignments.student": objectId(studId) },
          },
        ])
        .toArray();
      resolve(assignments);
    });
  },
  manualAttend: (studId) => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise(async (resolve, reject) => {
      let studattend = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .findOne({ student: objectId(studId) });
      if (studattend) {
        await db
          .get()
          .collection(collection.ATTENDANCE_COLLECTION)
          .updateOne(
            { student: objectId(studId), "attendance.date": datecheck },
            {
              $set: { "attendance.$.status": "Present",
              "attendance.$.percentage": 100,
            },
            }
          );
        resolve({ status: true });
      } else {
        let res =
          "Student was not logged in today. So attendance was not recorded";
        resolve(res);
      }
    });
  },
  getstudAttend: (studId) => {
    return new Promise(async (resolve, reject) => {
      let attend = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendate: "$attendance.date",
              status: "$attendance.status",
            },
          },
        ])
        .toArray();
      resolve(attend);
    });
  },
  getAttendance: () => {
    return new Promise(async (resolve, reject) => {
      let datecheck =
        ("0" + new Date().getDate()).slice(-2) +
        "-" +
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let attend = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              studId: "$student",
              attendate: "$attendance.date",
              status: "$attendance.status",
            },
          },
          {
            $match: { attendate: datecheck },
          },
          {
            $lookup: {
              from: collection.STUDENT_COLLECTION,
              localField: "studId",
              foreignField: "_id",
              as: "student",
            },
          },
        ])
        .toArray();
      resolve(attend);
    });
  },

  getAttendDate: (date) => {
    return new Promise(async (resolve, reject) => {
      let attend = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              studId: "$student",
              attendate: "$attendance.date",
              status: "$attendance.status",
            },
          },
          {
            $match: { attendate: date },
          },
          {
            $lookup: {
              from: collection.STUDENT_COLLECTION,
              localField: "studId",
              foreignField: "_id",
              as: "student",
            },
          },
        ])
        .toArray();
      resolve(attend);
    });
  },
  addAnnouncement: async (announce, callback) => {
    db.get()
      .collection(collection.ANNOUNCEMENT_COLLECTION)
      .insertOne(announce)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getAnnouncements: () => {
    return new Promise(async (resolve, reject) => {
      let announcement = await db
        .get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(announcement);
    });
  },
  getEvents: () => {
    return new Promise(async (resolve, reject) => {
      let event = await db
        .get()
        .collection(collection.EVENT_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(event);
    });
  },
  addEvent: async (event, callback) => {
    db.get()
      .collection(collection.EVENT_COLLECTION)
      .insertOne(event)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getEventDetails: (eventId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.EVENT_COLLECTION)
        .findOne({ _id: objectId(eventId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addPhotos: async (photo, callback) => {
    db.get()
      .collection(collection.PHOTO_COLLECTION)
      .insertOne(photo)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  deletePhoto: (photoId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PHOTO_COLLECTION)
        .removeOne({ _id: objectId(photoId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteAnnounce: (announceId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .removeOne({ _id: objectId(announceId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteEvent: (eventId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PAID_COLLECTION)
        .removeOne({ event: objectId(eventId) });
      db.get()
        .collection(collection.EVENT_COLLECTION)
        .removeOne({ _id: objectId(eventId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteDoc: (docId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_DOC_COLLECTION)
        .removeOne({ _id: objectId(docId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteVid: (vidId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_VID_COLLECTION)
        .removeOne({ _id: objectId(vidId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteYou: (youId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_U_VID_COLLECTION)
        .removeOne({ _id: objectId(youId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getPaidStudents: (eventId) => {
    return new Promise(async (resolve, reject) => {
      let paid = await db
        .get()
        .collection(collection.PAID_COLLECTION)
        .aggregate([
          {
            $match: { event: objectId(eventId) },
          },
          {
            $lookup: {
              from: collection.STUDENT_COLLECTION,
              localField: "student",
              foreignField: "_id",
              as: "students",
            },
          },
          {
            $project: {
              students: "$students",
            },
          },
        ])
        .toArray();
      resolve(paid);
    });
  },
};
