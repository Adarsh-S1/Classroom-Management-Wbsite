const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
module.exports.connect = function (done) {
  const url = "mongodb+srv://adarsh:adarsh@classroom-mangement.palw3.mongodb.net/classroom?retryWrites=true&w=majority"
  const dbname = "classroom";
  mongoClient.connect(url, {useUnifiedTopology: true} ,(err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
  });

  done();
};

module.exports.get = function () {
  return state.db;
};
