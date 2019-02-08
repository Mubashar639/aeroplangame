let express = require("express");
let app = express();
let bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
let mongoose=require("mongoose");

mongoose.connect('mongodb://message:123467m@ds213705.mlab.com:13705/mydatabase', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
console.log("h1");
db.once('open', function callback () {
  console.log("h");
});

let myusers = mongoose.model("mydb", new mongoose.Schema({name:"string",phonenumber:"number"}))

let user = new myusers({name: "mubashasr",phonenumber:989238453})
user.save()

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });
let fs = require('fs')
let multer= require("multer");
let session=require('express-session')
let passport= require("passport")
let localStatgy= require("passport-local").Strategy

app.use(session({secret:"this is secret"}))
app.use(passport.initialize())
app.use(passport.session());

let users=[
{id:'1', user:"mubashar", passKey:"1234"},
{id:'2', user:"Hussain", passKey:"14"},
]

passport.use(new localStatgy(
    function(username,password,next){
    let user = users.find((user)=>{
        return  user.user===username && user.passKey== password ;
    })
    if(user){
        next(null, user)
    }else{
        next(null, false)
    }
}))

passport.serializeUser(function(user,next){
    next(null , user.id)
})
passport.deserializeUser(function(id,next){
    let user=
    users.find((user)=>{
       return  user.id==id;
    })    
    next(null, user)
})


app.post("/loadpage",passport.authenticate("local"),function(req,res){
    res.redirect("/dashboar")
})

app.get('/dashboar', function (req, res) {
   if(req.isAuthenticated()){

            res.send("you are the reboot user " + req.user.user)
   }
})

let configration=multer.diskStorage({
    destination:function(req,res,next){
        next(null,'./upload')
    },
    filename:function(req,file,next){
            next(null,file.originalname)
        },
})

let upload= multer({storage:configration})

app.use(express.static("./build "))
// app.get("/mydata",(req,res)=>{
//     res.end('data is geting from root ')

// })
var data = [];
app.post("/login", (req, res) => {
    data.push(req.body)
    user= new myusers({name:req.body.name,number:req.body.password})
    user.save();
    fs.writeFile("files/" + req.body.name + ".txt", "this is name : " + req.body.name + "\n this is password : " + req.body.password, function (err) {
        if (err) {
            throw (err)
        }
    })
    console.log(data);
})


app.get('/getuser', function (req, res) {
    res.send(data);
})

app.post("/create", (req, res, next) => {
    fs.appendFile("myfiles/myfile.txt", "this is content of file" + '\n', function (err) {
        if (err) {
            next(err)
        }
    })
    res.end("file has been ctreatted")
})
app.post("/profile",upload.array("profilepic",10), (req, res, next) => {
    console.log(req.files);
    res.end("file is recienedkja")
})

app.get("/getdata", (req, res, next) => {
    fs.readFile("myfiles/myfile.txt", "utf8", function (err, mubashar) {
        if (err) {
            next(err)
        }else
        res.send(mubashar)
    })
})
app.delete("/remove", (req, res, next) => {
    fs.unlink("myfiles/myfile.txt", function (err) {
        if (err) {
            next(err)
        } else
            res.end("file is deleted mubashar bahi")
    })


})

app.use((err, req, res, next) => {  // 4 parameter in error hendler middle ware
    console.log(err)
    res.status(500).send("something in going wrong")
})

const PORT = process.env.PORT || 8080
app.listen(PORT, function () {
    console.log("Server is running");
});