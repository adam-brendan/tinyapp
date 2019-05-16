/////////////REQUIREMENTS/////////////

const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');


app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["43cU23"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


/////////////DATABASES/////////////

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "test"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync('dishwasher-funk', 10)
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: bcrypt.hashSync("test", 10)
  }
};


/////////////FUNCTIONS/////////////

// function from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// checks for instances of emails
const lookupEmail = (emailID) => {
  for (let user in users) {
    if(users[user].email === emailID) {
      return true;
    }
  }
  return false;
};

// looks up user from email
const findUser = (emailID) => {
  for (let user in users) {
    if (users[user].email === emailID) {
      return user;
    }
  }
  return null;
};

// retrieves urls for user
const urlsForUser = (id) => {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};

const loggedOn = (req) => {
  if (req.session["user_id"]) {
    return true;
  }
  return false;
}


/////////////POST/////////////

// handles login form submission
// sets cookie after user login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!lookupEmail(email)) {
    return res.status(403).send("Invalid email. Try again.");
  } else if (lookupEmail(email)) {
    if (!bcrypt.compareSync(password, users[findUser(email)].password)) {
      return res.status(403).send("Invalid password. Try again.");
    } else if (bcrypt.compareSync(password, users[findUser(email)].password)) { 
      req.session.user_id = findUser(email);
      res.redirect("/urls");
    }
  }
});

// stores registation information
app.post("/registration", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!password || !email) {
    return res.status(404).send("Empty username or password. Please try again.");
  }
  if (!loggedOn(req)) {
    let id = generateRandomString();
    if (!lookupEmail(email)) {
      users[id] = {
        id: id, 
        email: email,
        password: bcrypt.hashSync(password, 10)
      }
      req.session.user_id = id;
      res.redirect("/urls");
    } else if (lookupEmail(email)) {
      return res.status(404).send("Email already in use. Please use a different email.");
    }
  }
  else {
    res.redirect("/urls");
  }
});

// handles logout form submission
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// stores new URLs
app.post("/urls", (req, res) => {
  if (loggedOn(req)) {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    urlDatabase[shortURL.toString()] = { longURL: longURL, userID: req.session["user_id"] };
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

// removes a URL resource: /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (loggedOn(req)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// updates a user's longURL
app.post("/urls/:shortURL", (req, res) => {
  let shortU = req.params.shortURL;
  let userID = req.session["user_id"];
  if (userID === urlDatabase[shortU].userID) {
    urlDatabase[shortU].longURL = req.body.longURL;
    res.redirect("/urls"); 
  } else {
    res.redirect("/login");
  }
});


/////////////GET/////////////

// login page
app.get("/login", (req, res) => {
  if (loggedOn(req)) {
    let templateVars =  {
      urls: urlsForUser(req.session["user_id"]),
      user: users[req.session["user_id"]]
    }
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: null
    }
    res.render("login", templateVars);
  }
});

// register new user
app.get("/registration", (req, res) => {
  let templateVars = {
    user: undefined
  }

  res.render("registration", templateVars);
});

// display user's urls
app.get("/urls", (req, res) => {
  if (loggedOn(req)) {
    let templateVars =  {
      urls: urlsForUser(req.session["user_id"]),
      user: users[req.session["user_id"]]
    }
  res.render("urls_index", templateVars);
  } else {
    let templateVars = {
      user: undefined
    }
    res.render("urls_index", templateVars);
  }
});

// input new URL
app.get("/urls/new", (req, res) => {
  if (loggedOn(req)) {
    let templateVars = {
      urls: urlsForUser(req.session["user_id"]),
      user: users[req.session["user_id"]]
    }
    res.render("urls_new", templateVars);
  } else {
      res.redirect("/login")
  }
});

// user is redirected to the longURL
// e.g. for /u/b2xV2ns, req.params = {shortURL: "b2xVn2"}
// longURL = urlDatabase["b2xVn2"]
// need more work on this
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL.substring(0, 3) === "http" || longURL.substring(0, 4) === "https") {
    res.redirect(longURL);
  } else {
    longURL = "https://" + longURL
    res.redirect(longURL)
  }
});

// edit page for URLs
app.get("/urls/:shortURL", (req, res) => {
  if (loggedOn(req)) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session["user_id"]]
    }
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/////////////START SERVER/////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});