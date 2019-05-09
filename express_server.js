var express = require("express");
// every time app.used, it is invoking an express function
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var PORT = 8080; // Default port 8080

// read read me file on npm
// used for forms?
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// sets the view engine to use ejs
// view engine necessary to be able to use ejs files
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// user ID, email, and password storage
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// generates a 6-character string consisting of letters and numbers
// function from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// stores new URLs
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  var longURL = req.body.longURL;
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// get request is made on /u/ from the provided shortURL
// user is redirected to the longURL
// e.g. for /u/b2xV2ns, req.params = {shortURL: "b2xVn2"}
// longURL = urlDatabase["b2xVn2"]
// res.redirect() is a method from the response library
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// test page
app.get("/", (req, res) => {
  res.send("Hello!")
});

// pushes username information to index 
//get request is made on /urls page
// urlDatabase object in stored in templateVars object under the key "urls"
// templateVars obj is passed to urls_index.ejs via res.render
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// still a little unclear what get is doing here
// get request made on /urls/new page and is passed to urls_new.ejs
// what is being done here? why do we need it? how is this used in the rest of the program?
// urls_new is a form where the user inputs a longURL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// a POST route that removes a URL resource: /urls/:shortURL/delete
// after the resource has been deleted, redirection to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// updates a user's longURL
app.post("/urls/:id", (req, res) => {
  // console.log(req.body);
  // console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// handles login form submission
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

// handles logout form submission
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

// displays page to register a new user
app.get("/registration", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("registration", templateVars);
});

// stores registation information
app.post("/registration", (req, res) => {
  var id = generateRandomString();
  var email = req.body.email;
  var password = req.body.password;

  if (email && password && lookupEmail(email) === false) {
    users[id] = {id, email, password}
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    res.send("404 error");
  }
});

// helper function to check for instances of emails
const lookupEmail = (emailID) => {
  for (user in users) {
    if(users[user].email === emailID) {
      return true;
    } else {
      return false;
    }
  }
}



// get request being made on /urls/[passed shortURL]
//templateVars object created
//req.params is the full request from the user in the form of an object
//req.params.shortURL is the value of the shortURL key passed by the user
// the value for longURL comes from the original urlDatabse object at the shortURL key
// urls_show is being rendered, and templateVars is passed to it
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


// get request at /urls.json
// to debug endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});


// this starts the listen event at the above Port--this is displayed in terminal, too
app.listen(PORT, () => { //Why does this function not take any parameters?
  console.log(`Example app listening on port ${PORT}!`);
});