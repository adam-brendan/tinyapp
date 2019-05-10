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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "test"
  }
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
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "test"
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
  if (req.cookies["user_id"]) {
    var longURL = req.body.longURL;
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: longURL, userID: req.cookies["user_id"]};
    res.redirect("/urls");
  }
});

// get request is made on /u/ from the provided shortURL
// user is redirected to the longURL
// e.g. for /u/b2xV2ns, req.params = {shortURL: "b2xVn2"}
// longURL = urlDatabase["b2xVn2"]
// res.redirect() is a method from the response library
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.cookies["user_id"]].longURL;
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
// TRYING TO PRINT ONLY THE LIST OF URLS FOR THE LOGGED IN USER
// if statement not running
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars =  {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    }
  res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: undefined
    }
    res.render("urls_index", templateVars)
  }
});

// still a little unclear what get is doing here
// get request made on /urls/new page and is passed to urls_new.ejs
// what is being done here? why do we need it? how is this used in the rest of the program?
// urls_new is a form where the user inputs a longURL
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    }
    res.render("urls_new", templateVars);
  };
  res.redirect("/urls")
});

// a POST route that removes a URL resource: /urls/:shortURL/delete
// after the resource has been deleted, redirection to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  }
  else {
    res.redirect("urls")
  }
});

// updates a user's longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortU = req.params.shortURL;
  const userID = req.cookies["user_id"];
  if (userID === urlDatabase[shortU].userID) {
    urlDatabase[shortU].longURL = req.body.longURL;
    res.redirect("/urls") 
  } else {
    res.redirect("/login");
  }
});

// handles login form submission
// sets cookie after user login
app.post("/login", (req, res) => {
  var email = req.body.email; 
  var password = req.body.password;
  if (lookupEmail(email) === false) {
    return res.status(403).send("Invalid email. Try again.");
  } else if (lookupEmail(email) === true) {
    if (users[findUser(email)].password !== password) {
      return res.status(403).send("Invalid password. Try again.");
    } else if (users[findUser(email)].password === password) {
      res.cookie("user_id", findUser(email));

      res.redirect("/urls");
    }
  }
});



// handles logout form submission
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

// displays page to register a new user
app.get("/registration", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars =  {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    }
  res.render("registration", templateVars);
  } else {
    let templateVars = {
      user: undefined
    }
    res.render("registration", templateVars)
  }
});

// stores registation information
app.post("/registration", (req, res) => {
  var id = generateRandomString();
  var email = req.body.email;
  var password = req.body.password;

  if (email && password && lookupEmail(email) === false) {
    users[id] = {
      id: id, 
      email: email,
      password: password
    }
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    return res.status(404).send("Input valid username and/or password.");
  }
});

// helper function to check for instances of emails
const lookupEmail = (emailID) => {
  for (user in users) {
    if(users[user].email === emailID) {
      return true;
    }
  }
  return false;
}

const findUser = (emailID) => {
  for (let user in users) {
    if (users[user].email === emailID) {
      return user;
    }
  }
  return null;
}

const urlsForUser = (id) => {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url]
    }
  }
  return userURLs;
}


// get request being made on /urls/[passed shortURL]
//templateVars object created
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.cookies["user_id"]]
    }
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

// login page
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars =  {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    }
    res.render("login", templateVars);
  } else {
    let templateVars = {
      user: undefined
    }
    res.render("login", templateVars)
  }
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