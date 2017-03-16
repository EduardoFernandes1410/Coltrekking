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
var loginSucesso = false;
var index	= 'index.html';
var signout	= 'signout.html';
var logged = 'logged.html';

/***Carrega pagina inicial***/
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, index));
});

/***Posta usuario logado***/
app.post("/postUser", function(req, res) {
	console.log(req.body.name);
	userLogado = req.body;

	//Usuario logado com sucesso
	loginSucesso = true;
	//Depois de fazer login, manda pagina a ser redirecionado
	res.send("/redirectLogin");
});

/***Redireciona para pagina do usuario***/
app.get("/redirectLogin", function(req, res) {
	if(loginSucesso) {
		res.sendFile(path.join(__dirname, logged));
	}
	else {
		res.sendFile(path.join(__dirname, index));
	}
});

/***Acessa info do usuario logado***/
app.post("/login", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.json(userLogado);
});

/***Sign Out***/
app.get("/signout", function(req, res) {
	//Usuario deslogado
	loginSucesso = false;
	//Manda para pagina de logout
	res.sendFile(path.join(__dirname, signout));
});

app.listen(3000);