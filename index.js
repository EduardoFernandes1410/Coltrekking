var http	= require('http');
var fs		= require('fs');
var url		= require('url');
var path	= require('path');
var express = require('express');
var bodyParser	= require('body-parser');
var app 	= express();

//MySQL
var mysql		= require('mysql');
var connection	= mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: 'eduardo007',
	database: 'Coltrekking'
});

//Utilizar o BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Conecta ao Banco de Dados
connection.connect(function(err) {
	if(!err){
		console.log("Database connected...");
	}
	else{
		console.log("Error connecting to database...");
	}
});

//Variaveis de execucao
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

	//Adiciona usuario ao DB
	addDB();
	
	//Pega info do DB
	connection.query('SELECT fatork FROM Usuarios WHERE id = ?', userLogado.uid, function(err, rows, fields) {
		if(!err) {
			console.log(rows[0].fatork);
			//Retrieve fatork do DB
			userLogado.fatork = rows[0].fatork;
		}
		else {
			console.log('Error while performing Query!');
		}
	});

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

/***************************BANCO DE DADOS*****************************/
//*****Adicionar usuario ao DB*****//
function addDB() {
	//Pega propiedades do userLogado
	var nome = userLogado.name;
	var email = userLogado.email;
	var foto = userLogado.photoURL;
	var id = userLogado.uid;
	var fatorK = 0;
	var post = {nome: nome, email: email, foto: foto, id: id, fatorK: fatorK};

	//Adiciona ao DB
	connection.query('INSERT IGNORE INTO Usuarios SET ?', post, function(err, rows, fields) {
		if(!err) {
			console.log(rows);
		}
		else {
			console.log(err);
			console.log('Error while performing Query!');
		}
	});

	//Printa DB
	connection.query('SELECT * FROM Usuarios', function(err, rows, fields) {
		if(!err) {
			console.log(rows);
		}
		else {
			console.log('Error while performing Query!');
		}
	});
}

app.listen(3000);