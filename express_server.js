var express = require("express");
var app = express(); //What is this function actually doing?
var PORT = 8080; // Default port 8080

app.set("view engine", "ejs"); // tells the express app to use EJS as its templating engine, but why do we need this? What would happen if we didn't do this?

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => { //Where are these parameters coming from? Registers a handler on the root path?
  res.send("Hello!") // What is res.send? Res is an object?
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
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