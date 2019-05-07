var express = require("express");
var app = express(); //What is this function actually doing?
var PORT = 8080; // Default port 8080

app.set("view engine", "ejs"); // tells the express app to use EJS as its templating engine, but why do we need this? What would happen if we didn't do this?

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/", (req, res) => { //Where are these parameters coming from? Registers a handler on the root path?
  res.send("Hello!") // What is res.send? Res is an object?
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Working on this
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // What is happening here?
});

app.get("/hello", (req, res) => { // Is hello a file?
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.listen(PORT, () => { //Why does this function not take any parameters?
  console.log(`Example app listening on port ${PORT}!`);
});