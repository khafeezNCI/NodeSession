const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

const myusername = "user";
const mypassword = "password";

const oneDay = 1000 * 60 * 60 * 24;
const oneMin = 1000 * 60;
const jwtsecret = "the most secret string of text in history";

var session = null;

// parsing the incoming data

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//serving public file
app.use(express.static(__dirname));

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneMin },
    resave: false,
  })
);

app.use(cookieParser());

app.post("/user", (req, res) => {
  if (req.body.username == myusername && req.body.password == mypassword) {
    session = req.session;
    session.userid = req.body.username;
    session.visit = 0;
    console.log(req.session);
    res.redirect("/admin");
  } else {
    res.sendFile("error.html", { root: __dirname });
  }
});

app.get("/", (req, res) => {
  session = req.session;
  console.log("--------------------");
  console.log(session.visit);
  console.log("---------------------");
  if (session.userid) {
    res.sendFile("user.html", { root: __dirname });
  } else res.sendFile("index.html", { root: __dirname });
});

app.get("/user", (req, res) => {
  console.log(req.session);
  if (req.session.userid != undefined) {
    session.visit++;
    console.log("--------------------");
    console.log(session.visit);
    console.log("---------------------");
    res.sendFile("user.html", { root: __dirname });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  console.log("--------------------");
  console.log(req.session);
  req.session.destroy();
  console.log(req.sessiuon);
  session = null;
  res.redirect("/");
});

app.get("/admin", (req, res) => {
  if (req.session.userid != undefined) {
    console.log(req.headers);
    res.header("module", "SecureApplicationProgramming");
    res.sendFile("admin.html", { root: __dirname });
  } else {
    res.redirect("/");
  }
});

app.get("/jwt", (req, res) => {
  if (req.session.userid != undefined) {
    console.log(req.headers);
    res.header("module", "SecureApplicationProgramming");
    res.sendFile("jwt.html", { root: __dirname });
  } else {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  if (req.session.userid != undefined) {
    console.log(req.headers);
    if (req.body.username == myusername && req.body.password == mypassword) {
      res.json({
        status: "success",
        token: jwt.sign({ name: "John Doe", favColor: "green" }, jwtsecret),
      });
    } else {
      res.json({ status: "failure" });
    }
  } else {
    res.redirect("/");
  }
});

app.post("/topsecret", (req, res) => {
  jwt.verify(req.body.token, jwtsecret, function (err, decoded) {
    if (err) {
      res.json({ status: "failure" });
    } else {
      res.json({
        status: "success",
        message: `Hello ${decoded.name} your favorite color is ${decoded.favColor} and we can tell you the secret info that the sky is blue.`,
      });
    }
  });
});

app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));
