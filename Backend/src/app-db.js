const mongoose = require("mongoose");
const mongoUrl = process.env.mongoUrl || "mongodb://127.0.0.1:27017/fampedia";
const bcrypt = require("bcrypt");

const { log, sendToSocket } = require("./app");


mongoose.connect(mongoUrl);
// Try to connect to the database
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function () {
    log("Database connection successfully");
    if (process.env.user && process.env.password) {
        await testUser(process.env.user, process.env.password, true);
    }
});

process.on('SIGINT', async () => {
    await mongoose.disconnect();
    log("shutdown");
    process.exit(0);
});


/////////////////////////////
///// mongoose database schemata
/////////////////////////////
// moment
let mom = mongoose.Schema({
    momentID: Number,
    momenttitle: String,
    momentdescription: String,
    date: String,
    images: [String],
    familyID: String,
    taggedUsers: [String],
});
let logs = mongoose.Schema({
    message: String,
    date: String,
    permanent: Boolean,
});

let mom_comment = mongoose.Schema({
    userID: String,
    date: { type: Date, default: Date.now },
    desc: String,
    momentID: String,
});

let us = mongoose.Schema({
    user: String,
    hash: String,
    familyID: String
});
let token = mongoose.Schema({
    user: String,
    token: String,
    date: String
});
let image = mongoose.Schema({
    data50: Buffer,
    data320: Buffer,
    data640: Buffer,
    desc: String,
});
let family = mongoose.Schema({
    name: String,
    qrCode: Buffer
});

let news = mongoose.Schema({
    type: String,
    date: { type: Date, default: Date.now },
    userID: String,
    familyID: String,
    data: { imageID: String, comment: String }
});


mom.post('save', function (doc) {
    sendToSocket('moment', doc.familyID);
});

mom.post('update', function (doc) {
    sendToSocket('moment', doc.familyID);
});

mom_comment.post('save', function (doc) {
    MomentDB.findOne({ momentID: doc.momentID }).then((moment) => {
        sendToSocket('comment', moment.familyID);
    })
});

news.post('save', function (doc) {
    sendToSocket('news', doc.familyID);
});




async function testUser(user, password, keep = true) {
    let allUsers = await UserDB.find({
        user
    });

    if (allUsers.length === 0 || !keep) {
        mongoose.connection.db.dropDatabase();
        const fam = await new FamilyDB({ name: 'Test Family' }).save();
        let newUser = new UserDB({
            user,
            hash: await bcrypt.hash(password, 10),
            familyID: fam.id,
        });
        await newUser.save();
    }
}
exports.testUser = testUser;

const msDay = 1000 * 60 * 60 * 24;
setInterval(async () => {
    const logs = await LogsDB.find();
    for (const log of logs) {
        if (Date.now() - Date.parse(log.date) > msDay && !log.permanent) {
            await log.remove();
        }
    }
}, msDay); //Run every day

//database models
let ImageDB = mongoose.model("image", image);
exports.ImageDB = ImageDB;
let MomentDB = mongoose.model("Moment", mom);
exports.MomentDB = MomentDB;
let UserDB = mongoose.model("user", us);
exports.UserDB = UserDB;
let FamilyDB = mongoose.model("family", family);
exports.FamilyDB = FamilyDB;
let TokenDB = mongoose.model("token", token);
exports.TokenDB = TokenDB;
let LogsDB = mongoose.model("logs", logs);
exports.LogsDB = LogsDB;
let NewsDB = mongoose.model("news", news)
exports.NewsDB = NewsDB
let MomentCommentDB = mongoose.model("moment_comment", mom_comment)
exports.MomentCommentDB = MomentCommentDB
