# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLS (similar to bit.ly).


## Getting Started
1. Fork this repository, then clone your fork of this repository.
2. Install dependencies using the npm install command.
3. Start the web server using the npm run local command. The app will be served at http://localhost:8080/.
4. Go to http://localhost:8080/registration in your browser.
5. After registering an account, click "Shorten a new URL" and type in a long URL that you wish to shorten.
6. Your new short URL link can be visited by going http://localhost:8080/u/<YOUR SHORT URL HERE> whether you are logged in or not.
7. Your short URLs can also be deleted or edited to refer to a different long URL.

## Screenshots

!["login page"](docs/login-page.png)
!["registration page"](docs/registration-page.png)
!["index page"](docs/index-page.png)


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
