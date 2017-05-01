/********************************SETUP**********************************/
var http			= require('http');
var fs				= require('fs');
var url				= require('url');
var path			= require('path');
var express 		= require('express');
var bodyParser		= require('body-parser');
var session			= require('express-session');
var app 			= express();

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

//Utilizar o express-session
app.use(session({secret: 'S3NH4'}));

//Utilizar o express-static
app.use(express.static('./'));

//Conecta ao Banco de Dados
connection.connect(function(err) {
	if(!err){
		console.log("Database connected...");
	}
	else{
		console.log("Error connecting to database...");
	}
});

/*************************VARIAVEIS DE EXECUCAO**************************/
//var userLogado;
var loginSucesso = false;
var index	= './index.html';
var logout	= 'logout/index.html';
var login = 'login/index.html';

/******************************REQUISICOES*******************************/
//*****Carrega pagina inicial*****//
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, index));
});

//*****Posta usuario logado*****//
app.post("/postUser", function(req, res) {
	req.session.userLogado = req.body;
	//Adiciona usuario ao DB
	addDB(req);
	
	//Pega info do DB
	//pegaInfoUsuarioLogado(function callback() {
		//Usuario logado com sucesso
		loginSucesso = true;

		//Depois de fazer login, manda pagina a ser redirecionado
		res.send("/redirectLogin");
	//});

});

//*****Redireciona para pagina do usuario*****//
app.get("/redirectLogin", function(req, res) {
	if(loginSucesso) {
		res.sendFile(path.join(__dirname, login));
	}
	else {
		res.sendFile(path.join(__dirname, index));
	}
});

//*****Acessa info do usuario logado*****//
app.post("/login", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.json(req.session.userLogado);
});

//*****Ranking*****//
app.get("/ranking", function(req, res) {
	montaRanking(function callback() {
		//Atualiza info do usuario
		pegaInfoUsuarioLogado(req, function callback() {
			res.send();
		}); 
	});
});

//*****Log Out*****//
app.get("/logout", function(req, res) {
	//Deleta session
	delete req.session.userLogado;
	//Usuario deslogado
	loginSucesso = false;
	//Manda para pagina de logout
	res.sendFile(path.join(__dirname, logout));
});

/***************************BANCO DE DADOS*****************************/
//*****Adicionar usuario ao DB*****//
function addDB(req) {
	//Pega propiedades do req.session.userLogado
	var nome = req.session.userLogado.Nome;
	var email = req.session.userLogado.Email;
	var foto = req.session.userLogado.Foto;
	var id = req.session.userLogado.ID;
	var fatorK = 0;
	var posicao = 1;
	var listaNegra = 0;
	var admin = 0;
	var post = {Nome: nome, Email: email, Foto: foto, ID: id, FatorK: fatorK, Posicao: posicao, ListaNegra: listaNegra, Admin: admin};

	//Adiciona ao DB de Pessoas
	connection.query('INSERT IGNORE INTO Pessoa SET ?', post, function(err, rows, fields) {
		if(!err) {
			console.log(rows);
		}
		else {
			console.log(err);
			console.log('Error while performing Query (ADICIONA AO DB PESSOAS)');
		}
	});

	//Printa Tabela
	//printTabela('Pessoa');
}

//*****Pega Info do Usuario Logado*****//
function pegaInfoUsuarioLogado(req, callback) {
	connection.query('SELECT * FROM Pessoa WHERE ID = ?', req.session.userLogado.ID, function(err, rows, fields) {
		if(!err) {
			//Retrieve info do DB
			req.session.userLogado.FatorK = rows[0].FatorK;
			req.session.userLogado.Posicao = rows[0].Posicao;
			req.session.userLogado.ListaNegra = rows[0].ListaNegra;
			req.session.userLogado.Admin = rows[0].Admin;
			
			//Realiza o callback
			callback();
		}
		else {
			console.log('Error while performing Query (PEGA INFO DB)');
		}
	});
}

//*****Printa Tabela*****//
function printTabela(tabela) {
	connection.query('SELECT * FROM ??', [tabela], function(err, rows, fields) {
		if(!err) {
			console.log(rows);
		}
		else {
			console.log('Error while performing Query (PRINTA TABELA)');
		}
	});
}

//*****Monta Ranking*****//
function montaRanking(callback) {
	connection.query('SELECT ID, Nome, FatorK FROM Pessoa ORDER BY FatorK DESC', function(err, rows, fields) {
		if(!err) {
			//Atualiza a posicao no ranking
			for(var i = 0; i < rows.length; i++) {
				if(i == 0) {
					connection.query('UPDATE Pessoa SET Posicao = 1 WHERE ID = ?', rows[0].ID);
					rows[0].Posicao = 1;
				}
				else {
					if(rows[i].FatorK == rows[i - 1].FatorK) {
						connection.query('UPDATE Pessoa SET Posicao = ? WHERE ID = ?', [rows[i - 1].Posicao, rows[i].ID]);
						rows[i].Posicao = rows[i - 1].Posicao;
					}
					else {
						connection.query('UPDATE Pessoa SET Posicao = ? WHERE ID = ?', [(i + 1), rows[i].ID]);
						rows[i].Posicao = i + 1;
					}
				}
			}

			console.log(rows);
			callback();
		}
		else {
			console.log('Error while performing Query (MONTA RANKING)');
			console.log(err);
		}
	});
}

/*************************INICIA SERVIDOR*****************************/
app.listen(3000);