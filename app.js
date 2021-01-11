var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var http = require("http");
var usersRouter = require("./routes/user");
var tutorRouter = require("./routes/tutor");
var hbs = require("express-handlebars");
var app = express("express-session");
const server = http.createServer(app);
var io = require("socket.io")(server);
const collection = require("./config/collections");
io.on("connection", (socket) => {
  console.log("New connection_______________");
  socket.on("disconnect", () => {
    console.log("Connection Closed");
  });
  socket.on("message", (topic, type) => {
    console.log(type);
    let date =
      ("0" + new Date().getDate()).slice(-2) +
      "-" +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      "-" +
      new Date().getFullYear();
    var objtopi = {
      topic: topic,
      type: type,
      Date: date,
    };
    db.get().collection(collection.NOTI_COLLECTION).insertOne(objtopi);
    io.emit("topicassign", topic, type, date);
  });
});

var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var session = require("express-session");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/Partials/",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(session({ secret: "Key", cookie: { maxAge: 3600000 } }));
db.connect((err) => {
  if (err) console.log("connection error" + err);
  else console.log("--------Database Connected--------");
});

app.use("/", usersRouter);
app.use("/tutor", tutorRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app: app, server: server };
