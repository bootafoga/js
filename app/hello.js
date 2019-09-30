// вопросики (?)
  // js
  // get, use
  // скобки
  // проверка на ввод параметров

const express = require("express");
const app = express();

app.get("/home", function(request, response){
    response.send("<h1>Hello</h1>");
});

app.get("/about", function(request, response){
    response.send("<h1>About<h1>");
});

app.get("/hello", function(request, response){

    if (request.query.name !== undefined){
      response.send("<h1>Hello, " + request.query.name + "!<h1>");
    } else {
      response.send("<h1>Hello, user!<h1>");
    }
});

app.get("/", function(request, response){
    response.redirect("/home");
});

app.listen(8080);
