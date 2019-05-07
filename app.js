const http = require("http");
const PORT = 8080;

//A function which handles requests and sends response
//Registered as a callback function registered with the http module via createServer function
// Callback receives request and response arguments
function requestHandler(request, response) {
  if (request.url == "/") {
    response.end("Welcome!");
  } else if (request.url == "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("Unknown Path");
  }
 //Handles requests at one endpoint
 // response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
}

var server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});