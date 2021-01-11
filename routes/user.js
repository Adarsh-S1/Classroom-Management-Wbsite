var express = require("express");
const studentHelpers = require("../helpers/studentHelpers");
var router = express.Router();
var request = require("request");
const tutorHelpers = require("../helpers/tutorHelpers");
const { response } = require("express");
const qs = require("querystring");
const checksum_lib = require("../public/Paytm/checksum");
const config = require("../public/Paytm/config");
const paypal = require("paypal-rest-sdk");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
var text;
var paypalamount;
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AbX74hUUI9XSnWdLirx8m30xyIUptCo_6Om_4zMM3ooAiWFmwaeNGRiSokNqffNCb4GQ2bv2xHdmYFhY",
  client_secret:
    "EABtW--UjDatoF5DATsr8FtwqyoPYisrELA-L85WDsz_JMg9B05Uz_9poRdhJiHCNIT08lGphd56egOg",
});
let notifications;
const studentLogin = (req, res, next) => {
  if (req.session.loggedstudentIn) {
    studentHelpers.getNotifications().then((response) => {
      notifications = response;
    });
    studentHelpers.attendAllPage();
    studentHelpers.userTest(req.session.student._id).then((response) => {
      if (response.status) {
        console.log("");
      } else {
        studentHelpers.attendAllPage();
        req.session.destroy();
        res.redirect("/login");
      }
    });
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/", (req, res) => {
  studentHelpers.attendAllPage();
  res.render("home");
});
router.get("/student", studentLogin, (req, res) => {
  let stud = req.session.student;
  studentHelpers.attendhome(req.session.student._id).then((attendance) => {
    tutorHelpers.getEvents().then((events) => {
      tutorHelpers.getAnnouncements().then((announcement) => {
        res.render("Student/Stud-home", {
          stud,
          events,
          attendance,
          announcement,
          notifications,
        });
      });
    });
  });
});
router.get("/login", (req, res) => {
  studentHelpers.attendAllPage();
  if (req.session.loggedstudentIn) {
    res.redirect("/student");
  } else {
    res.render("Student/login", { loginErr: req.session.studentLoginErr });
    req.session.studentLoginErr = false;
  }
});

router.get("/otpnumber", (req, res) => {
  if (req.session.loggedstudentIn) {
    res.redirect("/student");
  } else {
    res.render("Student/otp-number", {
      otpErr: req.session.studentNumErr,
      otpInvalid: req.session.studentOtpInvalid,
    });
    req.session.studentOtpInvalid = false;
    req.session.studentNumErr = false;
    if (req.session.studentOtpInvalid) {
      console.log("______");
    } else {
      req.session.destroy();
    }
  }
});
router.post("/otpnumber", (req, res) => {
  studentHelpers.phoneNoCheck(req.body).then((response) => {
    if (response.status == true) {
      req.session.student = response.phone;
      var request = require("request");
      var options = {
        method: "POST",
        url: "https://d7networks.com/api/verifier/send",
        headers: {
          Authorization: "Token f66f1c31c8cd42263c609d933e96a6dfe81e5ccd",
        },
        formData: {
          mobile: "91" + req.body.Phone,
          sender_id: "D7VERIFY",
          message: "Your otp for classroom login is {code}",
          expiry: "900",
        },
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        text = response.body.substring(11, 47);
      });
      res.redirect("/otplogin");
    } else {
      req.session.studentNumErr = "This number is not registered in a account";
      res.redirect("/otpnumber");
    }
  });
});
router.get("/otplogin", (req, res) => {
  studentHelpers.attendAllPage();
  if (req.session.student) {
    if (req.session.loggedstudentIn) {
      res.redirect("/");
    } else {
      res.render("Student/otp-login");
    }
  } else {
    res.redirect("/otpnumber");
  }
});
router.post("/otplogin", (req, res) => {
  studentHelpers.OtpCheck(req.body).then((response) => {
    var options = {
      method: "POST",
      url: "https://d7networks.com/api/verifier/verify",
      headers: {
        Authorization: "Token f66f1c31c8cd42263c609d933e96a6dfe81e5ccd",
      },
      formData: {
        otp_id: text,
        otp_code: req.body.otp,
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var status = response.body.substring(11, 17);
      if (status == "failed") {
        req.session.studentOtpInvalid =
          "Invalid OTP.Enter mobile number Once again";
        res.redirect("/otpnumber");
      } else {
        req.session.loggedstudentIn = true;
        res.redirect("/student");
      }
    });
  });
});
router.post("/login", (req, res) => {
  studentHelpers.attendAllPage();
  studentHelpers.doStudentLogin(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.student;
      req.session.loggedstudentIn = true;
      res.redirect("/student");
    } else {
      req.session.studentLoginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});
router.get("/profile", studentLogin, function (req, res) {
  let studentDetails = req.session.student;
  res.render("Student/Profile", {
    student: true,
    studentDetails,
    notifications,
  });
});
router.get("/studentout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});
router.get("/today", studentLogin, (req, res) => {
  studentHelpers.todayNotes().then((doc) => {
    studentHelpers.todayUtube().then((uvideo) => {
      studentHelpers.todayVideo().then((video) => {
        studentHelpers.todayAssignments().then((assignments) => {
          res.render("Student/todays-task", {
            student: true,
            doc,
            video,
            stud: req.session.student,
            uvideo,
            assignments,
            notifications,
          });
        });
      });
    });
  });
});
router.get("/notes", studentLogin, (req, res) => {
  studentHelpers.Notes().then((doc) => {
    studentHelpers.utubeNotes().then((uvideo) => {
      studentHelpers.videoNotes().then((video) => {
        res.render("Student/notes", {
          student: true,
          doc,
          video,
          stud: req.session.student,
          uvideo,
          notifications,
        });
      });
    });
  });
});
router.get("/assignments", studentLogin, (req, res) => {
  studentHelpers.viewAssign().then((assign) => {
    res.render("Student/assignments", { student: true, assign, notifications });
  });
});
router.get("/assignments/:id", studentLogin, (req, res) => {
  let assignId = req.params.id;
  studentHelpers.subAssign(assignId).then((response) => {
    res.render("Student/subassign", { student: true, assignId, notifications });
  });
}),
  router.post("/assignments/:id", (req, res) => {
    studentHelpers
      .submitAssignment(req.params.id, req.session.student._id)
      .then((response) => {
        let file = req.files.file;
        file.mv("./public/studentAssignment/" + response + ".pdf", (err) => {
          if (!err) {
            res.redirect("/assignments");
          } else {
            console.log(err);
          }
        });
      });
  }),
  router.post("/attendvideo", studentLogin, (req, res) => {
    studentHelpers
      .attendance(req.body, req.session.student._id)
      .then((response) => {
        res.json({ status: true });
      });
  });
router.get("/attendate/:id", studentLogin, async (req, res) => {
  let attendance = await studentHelpers.getAttendDate(
    req.params.id,
    req.session.student._id
  );
  let date = req.params.id;
  studentHelpers
    .totalMonthDayPresent(req.session.student._id, date)
    .then((days) => {
      studentHelpers
        .totalMonthDays(req.session.student._id, date)
        .then((totalDays) => {
          studentHelpers
            .totalMonthDayAbsent(req.session.student._id, date)
            .then((totalabs) => {
              studentHelpers
                .totalMonthPercentage(req.session.student._id, date)
                .then((percentage) => {
                  res.render("Student/attend-month", {
                    student: true,
                    attendance,
                    date,
                    days,
                    totalDays,
                    totalabs,
                    percentage,
                    notifications,
                  });
                });
            });
        });
    });
});
router.get("/attendance", studentLogin, async (req, res) => {
  let attendance = await studentHelpers.getfullAttendance(
    req.session.student._id
  );
  studentHelpers.totalDayPresent(req.session.student._id).then((days) => {
    studentHelpers.totalDays(req.session.student._id).then((totalDays) => {
      studentHelpers
        .totalDayAbsent(req.session.student._id)
        .then((totalabs) => {
          studentHelpers
            .totalPercentage(req.session.student._id)
            .then((percentage) => {
              res.render("Student/attendance", {
                student: true,
                attendance,
                days,
                totalDays,
                totalabs,
                percentage,
                notifications,
              });
            });
        });
    });
  });
});
router.get("/announcement", studentLogin, (req, res) => {
  tutorHelpers.getAnnouncements().then((announcement) => {
    res.render("Student/announcement", {
      student: true,
      announcement,
      notifications,
    });
  });
});
router.get("/announcement/:id", studentLogin, (req, res) => {
  studentHelpers.getAnnounceDetails(req.params.id).then((announcement) => {
    const fs = require("fs");

    let path = "./public/Announcements/pdf/" + announcement._id + ".pdf";
    let path1 = "./public/Announcements/photo/" + announcement._id + ".jpg";
    if (fs.existsSync(path) && fs.existsSync(path1)) {
      let pathimg = "../Announcements/photo/" + announcement._id + ".jpg";
      let pathpdf = "../Notes/open-document.png";
      res.render("Student/announcedetails", {
        student: true,
        announcement,
        pathimg,
        pathpdf,
      });
    } else if (fs.existsSync(path) && !fs.existsSync(path1)) {
      let pathpdf = "../Notes/open-document.png";
      res.render("Student/announcedetails", {
        student: true,
        announcement,
        pathpdf,
        notifications,
      });
    } else if (!fs.existsSync(path) && fs.existsSync(path1)) {
      let pathimg = "../Announcements/photo/" + announcement._id + ".jpg";
      res.render("Student/announcedetails", {
        student: true,
        announcement,
        pathimg,
        notifications,
      });
    } else if (!fs.existsSync(path) && !fs.existsSync(path1)) {
      res.render("Student/announcedetails", { student: true, announcement });
    }
  });
});
router.get("/gallery", studentLogin, (req, res) => {
  studentHelpers.getPhotos().then((photos) => {
    res.render("Student/gallery", { student: true, photos, notifications });
  });
});
router.get("/event/:id", studentLogin, (req, res) => {
  studentHelpers
    .getEventDetails(req.params.id, req.session.student._id)
    .then((event) => {
      const fs = require("fs");
      let path = "./public/Events/pdf/" + event._id + ".pdf";
      let path1 = "./public/Events/photo/" + event._id + ".jpg";
      if (event.Type == "Free") {
        if (fs.existsSync(path) && fs.existsSync(path1)) {
          let pathimg = "/Events/photo/" + event._id + ".jpg";
          let pathpdf = "/Notes/open-document.png";
          res.render("Student/eventfree", {
            student: true,
            event,
            pathimg,
            pathpdf,
            notifications,
          });
        } else if (fs.existsSync(path) && !fs.existsSync(path1)) {
          let pathpdf = "/Notes/open-document.png";
          res.render("Student/eventfree", {
            student: true,
            event,
            pathpdf,
            notifications,
          });
        } else if (!fs.existsSync(path) && fs.existsSync(path1)) {
          let pathimg = "/Events/photo/" + event._id + ".jpg";
          res.render("Student/eventfree", {
            student: true,
            event,
            pathimg,
            notifications,
          });
        } else if (!fs.existsSync(path) && !fs.existsSync(path1)) {
          res.render("Student/eventfree", {
            student: true,
            event,
            notifications,
          });
        }
      } else if (event.Type == "Paid") {
        let status = "false";

        if (event.students) {
          for (var i = 0; i < event.students.length; i++) {
            if (req.session.student._id == event.students[i]) {
              status = "true";
              {
                break;
              }
            }
          }
          if (status == "false") {
            if (fs.existsSync(path) && fs.existsSync(path1)) {
              let pathimg = "/Events/photo/" + event._id + ".jpg";
              let pathpdf = "/Notes/open-document.png";
              res.render("Student/eventpaid", {
                student: true,
                event,
                pathimg,
                pathpdf,
                stud: req.session.student,
                notifications,
              });
            } else if (fs.existsSync(path) && !fs.existsSync(path1)) {
              let pathpdf = "/Notes/open-document.png";
              res.render("Student/eventpaid", {
                student: true,
                event,
                pathpdf,
                stud: req.session.student,
              });
            } else if (!fs.existsSync(path) && fs.existsSync(path1)) {
              let pathimg = "/Events/photo/" + event._id + ".jpg";
              res.render("Student/eventpaid", {
                student: true,
                event,
                pathimg,
                stud: req.session.student,
                notifications,
              });
            } else if (!fs.existsSync(path) && !fs.existsSync(path1)) {
              res.render("Student/eventpaid", {
                student: true,
                event,
                stud: req.session.student,
              });
            }
          } else if (status == "true") {
            if (fs.existsSync(path) && fs.existsSync(path1)) {
              let pathimg = "/Events/photo/" + event._id + ".jpg";
              let pathpdf = "/Notes/open-document.png";
              res.render("Student/event-done", {
                student: true,
                event,
                pathimg,
                pathpdf,
                stud: req.session.student,
                notifications,
              });
            } else if (fs.existsSync(path) && !fs.existsSync(path1)) {
              let pathpdf = "/Notes/open-document.png";
              res.render("Student/event-done", {
                student: true,
                event,
                pathpdf,
                stud: req.session.student,
                notifications,
              });
            } else if (!fs.existsSync(path) && fs.existsSync(path1)) {
              let pathimg = "/Events/photo/" + event._id + ".jpg";
              res.render("Student/event-done", {
                student: true,
                event,
                pathimg,
                stud: req.session.student,
                notifications,
              });
            } else if (!fs.existsSync(path) && !fs.existsSync(path1)) {
              res.render("Student/event-done", {
                student: true,
                event,
                stud: req.session.student,
                notifications,
              });
            }
          }
        } else {
          if (fs.existsSync(path) && fs.existsSync(path1)) {
            let pathimg = "/Events/photo/" + event._id + ".jpg";
            let pathpdf = "/Notes/open-document.png";
            res.render("Student/eventpaid", {
              student: true,
              event,
              pathimg,
              pathpdf,
              stud: req.session.student,
              notifications,
            });
          } else if (fs.existsSync(path) && !fs.existsSync(path1)) {
            let pathpdf = "/Notes/open-document.png";
            res.render("Student/eventpaid", {
              student: true,
              event,
              pathpdf,
              stud: req.session.student,
              notifications,
            });
          } else if (!fs.existsSync(path) && fs.existsSync(path1)) {
            let pathimg = "/Events/photo/" + event._id + ".jpg";
            res.render("Student/eventpaid", {
              student: true,
              event,
              pathimg,
              stud: req.session.student,
              notifications,
            });
          } else if (!fs.existsSync(path) && !fs.existsSync(path1)) {
            res.render("Student/eventpaid", {
              student: true,
              event,
              stud: req.session.student,
              notifications,
            });
          }
        }
      }
    });
});
router.get("/success", studentLogin, (req, res) => {
  res.render("Student/success");
});
router.get("/failed", studentLogin, (req, res) => {
  res.render("Student/failed");
});
router.post("/payevent", studentLogin, (req, res) => {
  studentHelpers
    .generateRazorPay(req.body, req.body.amount)
    .then((response) => {
      res.json(response);
    });
});
router.post("/verify-payment", studentLogin, (req, res) => {
  studentHelpers
    .verifyPayment(req.body, req.session.student._id)
    .then(() => {
      studentHelpers
        .eventBook(req.body["order[receipt]"], req.session.student._id)
        .then(() => {
          res.json({ status: true });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});
router.post("/paytm", studentLogin, [parseUrl, parseJson], (req, res) => {
  // Route for making payment

  var paymentDetails = {
    amount: req.body.amount,
    studId: req.body.studId,
    eventId: req.body.eventId,
  };

  var params = {};
  params["MID"] = config.PaytmConfig.mid;
  params["WEBSITE"] = config.PaytmConfig.website;
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  params["ORDER_ID"] = paymentDetails.eventId + new Date().getMilliseconds();
  params["CUST_ID"] = paymentDetails.studId;
  params["TXN_AMOUNT"] = paymentDetails.amount;
  params["CALLBACK_URL"] = "http://adarshs.in/callback";
  params["EMAIL"] = "";
  params["MOBILE_NO"] = "";

  checksum_lib.genchecksum(
    params,
    config.PaytmConfig.key,
    function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging

      var form_fields = "";
      for (var x in params) {
        form_fields +=
          "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields +=
        "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          form_fields +
          '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
      );
      res.end();
    }
  );
});
router.post("/callback", (req, res) => {
  var eventId = req.body.ORDERID.substring(0, 24);
  if (req.body.STATUS == "TXN_SUCCESS") {
    studentHelpers
      .eventBook(eventId, req.session.student._id)
      .then((response) => {
        studentHelpers
          .paytmAdd(req.session.student._id, eventId)
          .then((response) => {
            res.redirect("/success");
          });
      });
  } else {
    res.redirect("/failed");
  }
});
router.post("/paypal", studentLogin, (req, res) => {
  paypalamount = req.body.amount;
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://adarshs.in/paypalsuccess",
      cancel_url: "http://adarshs.in/failed",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: " ",
              sku: "001",
              price: paypalamount,
              currency: "INR",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "INR",
          total: paypalamount,
        },
        description: req.body.eventId,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    console.log(payment);
    if (error) {
      console.log(error);
      res.redirect("/failed");
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});
router.get("/paypalsuccess", studentLogin, (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "INR",
          total: paypalamount,
        },
      },
    ],
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error);
        res.redirect("/failed");
      } else {
        console.log(payment);
        studentHelpers
          .eventBook(
            payment.transactions[0].description,
            req.session.student._id
          )
          .then((response) => {
            studentHelpers
              .paytmAdd(
                req.session.student._id,
                payment.transactions[0].description
              )
              .then((response) => {
                res.redirect("/success");
              });
          });
      }
    }
  );
});
router.get("/events", studentLogin, (req, res) => {
  tutorHelpers.getEvents().then((events) => {
    res.render("Student/events", { student: true, events, notifications });
  });
});
module.exports = router;
