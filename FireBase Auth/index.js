var http	= require('http');
var fs		= require('fs');
var url		= require('url');
var path	= require('path');
var express = require('express');
var bodyParser	= require('body-parser');
var app 	= express();

//Utilizar o BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var userLogado;
var index	= 'index.html';
var signout	= 'signout.html';
var logged = 'logged.html';

var logado = true;

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, index));
});

app.post("/postUser", function(req, res) {
	console.log(req.body.name);
	userLogado = req.body;
	res.send("");
});

app.get("/redirectLogin", function(req, res) {
	res.sendFile(path.join(__dirname, logged));
});

app.post("/login", function(req, res) {
	console.log("LOGGIN");
	res.setHeader('Content-Type', 'application/json');
	res.json(logado);
});

app.get("/signout", function(req, res) {
	console.log("SAIR");
	res.sendFile(path.join(__dirname, signout));
});

app.listen(3000);