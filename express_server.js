var express = require("express");
// every time app.used, it is invoking an express function
var app = express();
var PORT = 8080; // Default port 8080

// sets the view engine to use ejs
// view engine necessary to be able to use ejs files
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// read read me file on npm
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// post request is made on /urls
// longURL is stored from the request
// shortURL is randomly generated from the called function
// a new key value is passed to the urlDatabase object
// client is redirected to the short URL generated for their long URL
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

// get request is made on /urls page
// urlDatabase object in stored in templateVars object under the key "urls"
// templateVars obj is passed to urls_index.ejs via res.render
// not necessary to include .ejs extension
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// get request made on /urls/new page and is passed to urls_new.ejs
// what is being done here? why do we need it? how is this used in the rest of the program?
// urls_new is a form where the user inputs a longURL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// add a POST route that removes a URL resource: POST /urls/:shortURL/delete
// use Javascript's delete operator to remove the URL
// after the resource has been deleted, redirect the client back to the urls_index page ("/urls")
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// get request being made on /urls/[passed shortURL]
//templateVars object created
//req.params is the full request from the user in the form of an object
//req.params.shortURL is the value of the shortURL key passed by the user
// the value for longURL comes from the original urlDatabse object at the shortURL key
// urls_show is being rendered, and templateVars is passed to it
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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