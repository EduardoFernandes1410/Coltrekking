//Declara muitas variaveis
var path		= require('path');
var express		= require("express");
var bodyParser	= require('body-parser');
var mysql		= require('mysql');
var connection	= mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: 'eduardo007',
	database: 'teste'
});
var app = express();
var paginaInicial = 'getUser.html';

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

/************************REQUISICOES*************************/
//*****Carregar Pagina*****//
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, paginaInicial));
});

//*****Criar Usuario*****//
app.post("/createUser", function(req, res) {
	var nome = req.body.nome;
	var senha = req.body.senha;
	var fatorK = req.body.fatorK;
	var post = {nome: nome, senha: senha, fatorK: fatorK};

	//Adiciona ao DB
	connection.query('INSERT INTO testetable2 SET ?', post, function(err, rows, fields) {
		if(!err)
			console.log(rows);
		else
			console.log('Error while performing Query!');
	});

	//Printa DB
	connection.query('SELECT * FROM testetable2', function(err, rows, fields) {
		if(!err)
			console.log(rows);
		else
			console.log('Error while performing Query!');
	});

	//Retorna pagina de UsuarioCriado
	res.sendFile(path.join(__dirname, 'userCreated.html'));
});

//*****Retornar Usuario*****//
app.post("/getUser", function(req, res) {
	var nome = req.body.nome;

	//Query info
	connection.query('SELECT * FROM testetable2 WHERE nome = ?', nome, function(err, rows, fields) {
		res.setHeader('Content-Type', 'application/json');
		res.json(rows);
	});
});
/***************************************************************/

//Porta
app.listen(3000);



/*Exemplo de POST
var post = {nome: 'Humberto Honda', senha: 'asiatico', fatorK: 300};
connection.query('INSERT INTO testetable2 SET ?', post, function(err, rows, fields) {
	if(!err)
		console.log(rows);
	else
		console.log('Error while performing Query!');
});
*/

/*Exemplo de Query
connection.query('SELECT * FROM testetable2', function(err, rows, fields) {
	if(!err)
		console.log(rows);
	else
		console.log('Error while performing Query!');
});
*/
