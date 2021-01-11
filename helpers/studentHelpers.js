const db = require("../config/connection");
const collection = require("../config/collections");
const { response } = require("express");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_pd71wI8aXMt1wf",
  key_secret: "Y6k49kYdekn5xMd9HB5gY50o",
});
module.exports = {
  doStudentLogin: (studentDetails) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      const student = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ Username: studentDetails.Username });
      if (student) {
        bcrypt
          .compare(studentDetails.Password, student.Password)
          .then((status) => {
            if (status) {
              response.student = student;
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
  phoneNoCheck: (studentDetails) => {
    return new Promise(async (resolve, reject) => {
      const response = {};
      let status;
      const phone = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ Phone: studentDetails.Phone });
      if (phone) {
        response.phone = phone;
        response.status = true;
        resolve(response);
      } else {
        status = false;
      }
      resolve(status);
    });
  },
  OtpCheck: (studentDetails) => {
    return new Promise(async (resolve, reject) => {
      resolve(studentDetails.otp);
    });
  },
  userTest: (studId) => {
    return new Promise(async (resolve, reject) => {
      const userexist = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: objectId(studId) });
      if (userexist) {
        resolve({ status: true });
      } else {
        resolve({ status: false });
      }
    });
  },
  Notes: () => {
    return new Promise(async (resolve, reject) => {
      const doc = await db
        .get()
        .collection(collection.NOTES_DOC_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(doc);
    });
  },
  videoNotes: () => {
    return new Promise(async (resolve, reject) => {
      const video = await db
        .get()
        .collection(collection.NOTES_VID_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(video);
    });
  },
  utubeNotes: () => {
    return new Promise(async (resolve, reject) => {
      const uvideo = await db
        .get()
        .collection(collection.NOTES_U_VID_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(uvideo);
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
  subAssign: (assignId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .findOne({ _id: objectId(assignId) });
      resolve(response);
    });
  },
  submitAssignment: (assignId, student) => {
    let id = objectId(student);
    let assid = objectId();
    let subassignment = {
      student: id,
      assignment: assid,
    };

    return new Promise((resolve, reject) => {
      if (
        db
          .get()
          .collection(collection.ASSIGNMENT_COLLECTION)
          .findOne({ _id: objectId(assignId) })
      ) {
        db.get()
          .collection(collection.ASSIGNMENT_COLLECTION)
          .updateOne(
            { _id: objectId(assignId) },
            {
              $push: { assignments: subassignment },
            }
          )
          .then((response) => {
            resolve(assid);
          });
      }
    });
  },
  attendAllPage: () => {
    return new Promise(async (resolve, reject) => {
      let datecheck =
        ("0" + new Date().getDate()).slice(-2) +
        "-" +
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let dateexist = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .findOne({ "attendance.date": datecheck });
      if (dateexist) {
        console.log("");
      } else {
        let studattend;
        let attendDetailObj;
        if (new Date().getDay() == 0) {
          attendObj = {
            date:
              ("0" + new Date().getDate()).slice(-2) +
              "-" +
              ("0" + (new Date().getMonth() + 1)).slice(-2) +
              "-" +
              new Date().getFullYear(),
            month:
              ("0" + (new Date().getMonth() + 1)).slice(-2) +
              "-" +
              new Date().getFullYear(),
            status: "Holiday",
          };
        } else {
          attendObj = {
            date:
              ("0" + new Date().getDate()).slice(-2) +
              "-" +
              ("0" + (new Date().getMonth() + 1)).slice(-2) +
              "-" +
              new Date().getFullYear(),
            month:
              ("0" + (new Date().getMonth() + 1)).slice(-2) +
              "-" +
              new Date().getFullYear(),
            status: "Absent",
            percentage: 0,
          };
        }
        let userfind = await db
          .get()
          .collection(collection.STUDENT_COLLECTION)
          .aggregate([
            {
              $project: {
                _id: "$_id",
              },
            },
          ])
          .toArray();
        for (var i = 0; i < userfind.length; i++) {
          studattend = await db
            .get()
            .collection(collection.ATTENDANCE_COLLECTION)
            .findOne({ student: objectId(userfind[i]._id) });
          if (studattend) {
            let attendExist = studattend.attendance.findIndex(
              (attendanc) => attendanc.date == attendObj.date
            );
            if (attendExist == -1) {
              db.get()
                .collection(collection.ATTENDANCE_COLLECTION)
                .updateOne(
                  { student: objectId(userfind[i]._id) },
                  {
                    $push: { attendance: attendObj },
                  }
                )
                .then((response) => {
                  resolve();
                });
            }
          } else {
            var id = userfind[i];
            attendDetailObj = {
              student: id._id,
              attendance: [attendObj],
            };
            db.get()
              .collection(collection.ATTENDANCE_COLLECTION)
              .insertOne(attendDetailObj);
          }
        }
      }
    });
  },
  attendhome: (studId) => {
    return new Promise((resolve, reject) => {
      let datecheck =
        ("0" + new Date().getDate()).slice(-2) +
        "-" +
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      db.get()
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
          {
            $match: { attendate: datecheck },
          },
        ])
        .toArray()
        .then((attend) => {
          resolve(attend);
        });
    });
  },
  attendance: (date, studId) => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise(async (resolve, reject) => {
      if (!new Date().getDay() == 0) {
        if (date.Date == datecheck) {
          await db
            .get()
            .collection(collection.ATTENDANCE_COLLECTION)
            .updateOne(
              { student: objectId(studId), "attendance.date": datecheck },
              {
                $set: {
                  "attendance.$.status": "Present",
                  "attendance.$.percentage": 100,
                },
              }
            );
        }
      }
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
          {
            $match: { attendate: datecheck },
          },
        ])
        .toArray();
      resolve(attend);
    });
  },
  getfullAttendance: (studId) => {
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
  totalDays: (studId) => {
    return new Promise(async (resolve, reject) => {
      let totalOpenDays = 0;
      let monthcheck =
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let totalDays = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < totalDays.length; i++) {
        if (totalDays[i].attendance.status != "Holiday") totalOpenDays++;
      }
      resolve(totalOpenDays);
    });
  },
  totalDayPresent: (studId) => {
    return new Promise(async (resolve, reject) => {
      let daysPresent = 0;
      let monthcheck =
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let days = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < days.length; i++) {
        if (days[i].attendance.status == "Present") daysPresent++;
      }
      resolve(daysPresent);
    });
  },
  totalDayAbsent: (studId) => {
    return new Promise(async (resolve, reject) => {
      let daysAbsent = 0;
      let monthcheck =
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let days = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < days.length; i++) {
        if (days[i].attendance.status == "Absent") daysAbsent++;
      }
      resolve(daysAbsent);
    });
  },
  totalPercentage: (studId) => {
    return new Promise(async (resolve, reject) => {
      let totalOpenDays = 0;
      let monthcheck =
        ("0" + (new Date().getMonth() + 1)).slice(-2) +
        "-" +
        new Date().getFullYear();
      let totalDays = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < totalDays.length; i++) {
        if (totalDays[i].attendance.status != "Holiday") totalOpenDays++;
      }
      let numeratorTotal = 0;
      let numerator = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
          {
            $match: {
              $or: [
                { "attendance.status": "Present" },
                { "attendance.status": "Absent" },
              ],
            },
          },
        ])
        .toArray();
      console.log(numerator);
      for (var i = 0; i < numerator.length; i++) {
        numeratorTotal += numerator[i].attendance.percentage;
      }
      let percentage = numeratorTotal / totalOpenDays;
      resolve(percentage);
    });
  },
  totalMonthDays: (studId, monthcheck) => {
    return new Promise(async (resolve, reject) => {
      let totalOpenDays = 0;

      let totalDays = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < totalDays.length; i++) {
        if (totalDays[i].attendance.status != "Holiday") totalOpenDays++;
      }
      resolve(totalOpenDays);
    });
  },
  totalMonthDayPresent: (studId, monthcheck) => {
    return new Promise(async (resolve, reject) => {
      let daysPresent = 0;

      let days = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < days.length; i++) {
        if (days[i].attendance.status == "Present") daysPresent++;
      }
      resolve(daysPresent);
    });
  },
  totalMonthDayAbsent: (studId, monthcheck) => {
    return new Promise(async (resolve, reject) => {
      let daysAbsent = 0;

      let days = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < days.length; i++) {
        if (days[i].attendance.status == "Absent") daysAbsent++;
      }
      resolve(daysAbsent);
    });
  },
  totalMonthPercentage: (studId, monthcheck) => {
    return new Promise(async (resolve, reject) => {
      let totalOpenDays = 0;

      let totalDays = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < totalDays.length; i++) {
        if (totalDays[i].attendance.status != "Holiday") totalOpenDays++;
      }
      let numeratorTotal = 0;
      let numerator = await db
        .get()
        .collection(collection.ATTENDANCE_COLLECTION)
        .aggregate([
          {
            $match: { student: objectId(studId) },
          },
          {
            $match: { "attendance.month": monthcheck },
          },
          {
            $unwind: "$attendance",
          },
          {
            $project: {
              attendance: "$attendance",
            },
          },
        ])
        .toArray();
      for (var i = 0; i < numerator.length; i++) {
        numeratorTotal += numerator[i].attendance.percentage;
      }
      let percentage = numeratorTotal / totalOpenDays;
      resolve(percentage);
    });
  },
  getAnnounceDetails: (announceId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ANNOUNCEMENT_COLLECTION)
        .findOne({ _id: objectId(announceId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAttendDate: (date, studId) => {
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
              date: "$attendance.month",
              status: "$attendance.status",
            },
          },
          {
            $match: { date: date },
          },
        ])
        .toArray();
      resolve(attend);
    });
  },
  getPhotos: () => {
    return new Promise(async (resolve, reject) => {
      let photo = await db
        .get()
        .collection(collection.PHOTO_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(photo);
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
  eventBook: (eventId, studId) => {
    return new Promise(async (resolve, reject) => {
      let paidevent = await db
        .get()
        .collection(collection.EVENT_COLLECTION)
        .findOne({ _id: objectId(eventId), Type: "Paid" });
      if (paidevent) {
        if (
          await db
            .get()
            .collection(collection.EVENT_COLLECTION)
            .findOne({ _id: objectId(eventId), students: objectId(studId) })
        ) {
          console.log("FOUND________________________");
        } else {
          db
            .get()
            .collection(collection.EVENT_COLLECTION)
            .updateOne(
              { _id: objectId(eventId) },
              {
                $push: { students: objectId(studId) },
              }
            ).then;
        }
      }
      resolve();
    });
  },
  generateRazorPay: (event, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + event.eventId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details, studId) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "Y6k49kYdekn5xMd9HB5gY50o");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        let paidObj = {
          student: objectId(studId),
          event: objectId(details["order[receipt]"]),
        };
        db.get().collection(collection.PAID_COLLECTION).insertOne(paidObj);
        resolve();
      } else {
        reject();
      }
    });
  },
  paytmAdd: (studId, eventId) => {
    return new Promise((resolve, reject) => {
      let paidObj = {
        student: objectId(studId),
        event: objectId(eventId),
      };
      db.get().collection(collection.PAID_COLLECTION).insertOne(paidObj);
      resolve();
    });
  },
  todayNotes: () => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_DOC_COLLECTION)
        .find({ Date: datecheck })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  todayUtube: () => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_U_VID_COLLECTION)
        .find({ Date: datecheck })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  todayVideo: () => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.NOTES_VID_COLLECTION)
        .find({ Date: datecheck })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  todayAssignments: () => {
    let datecheck =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find({ "Topic.Date": datecheck })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getNotifications: () => {
    return new Promise(async (resolve, reject) => {
      let notifications = await db
        .get()
        .collection(collection.NOTI_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .toArray();
      resolve(notifications);
    });
  },
};
