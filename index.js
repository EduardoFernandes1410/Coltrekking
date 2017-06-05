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
app.use(express.static('./', {
	index: 'html/login/index.html'
}));

//Conecta ao Banco de Dados
connection.connect(function(err) {
	if(!err){
		console.log("Database connected...");
	}
	else{
		console.log("Error connecting to database...");
	}
});

/*********************************PAGINAS********************************/
var index	= '/html/index.html';
var login = '/html/login/index.html';

/*************************VARIAVEIS DE EXECUCAO**************************/
//Construtor do usuario
function Usuario(nome, email, foto, id, fatork, posicao, listaNegra, admin) {
	this.Nome = nome;
	this.Email = email;
	this.Foto = foto;
	this.ID = id;
	this.FatorK = fatork;
	this.Posicao = posicao;
	this.ListaNegra = listaNegra;
	this.Admin = admin;
}

/******************************REQUISICOES*******************************/
//*****Carrega pagina inicial*****//
app.get("/", function(req, res) {
	req.session.loginSucesso = false;
	res.sendFile(path.join(__dirname, login));
});

//*****Posta usuario logado*****//
app.post("/post-user", function(req, res) {
	req.session.usuarioLogado = req.body;

	//Adiciona usuario ao DB
	addDB(req);	
	req.session.loginSucesso = true;

	//Pega info como fatork, posicao, etc
	pegaInfoUsuarioLogado(req, function callback() {
		//Depois de fazer login, manda pagina a ser redirecionado
		res.send("/main-page");
	});

});

//*****Redireciona para pagina principal*****//
app.get("/main-page", function(req, res) {
	if(req.session.loginSucesso) {
		res.sendFile(path.join(__dirname, index));
	}
	else {
		res.sendFile(path.join(__dirname, login));
	}
});

//*****Acessa info do usuario logado*****//
app.get("/get-user", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.json(req.session.usuarioLogado);
});

//*****Criar Evento*****//
app.post("/criar-evento", function(req, res) {
	console.log(req.body);

	criarEventoDB(req.body, function(status) {
		status ? console.log("Evento criado com sucesso") : console.log("Evento nao foi criado");
		res.send(status);
	});
});

//******Get Eventos*****//
app.get("/eventos", function(req, res) {
	getEventos(function(rows) {
		res.send(rows);
	})
});

//*****Ranking*****//
app.get("/ranking", function(req, res) {
	montaRanking(function callback(rows) {
		//Atualiza info do usuario
		pegaInfoUsuarioLogado(req, function callback() {
			res.send(rows);
		}); 
	});
});

//*****Log Out*****//
app.get("/logout", function(req, res) {
	//Deleta session
	delete req.session.usuarioLogado;
	//Usuario deslogado
	loginSucesso = false;
	//Manda para pagina de logout
	res.sendFile(path.join(__dirname, login));
});

/***************************BANCO DE DADOS*****************************/
//*****Adicionar usuario ao DB*****//
function addDB(req) {
	//Cria usuario com propriedades do req.session.usuarioLogado
	var usuario = new Usuario(req.session.usuarioLogado.Nome, req.session.usuarioLogado.Email, req.session.usuarioLogado.Foto, req.session.usuarioLogado.ID, 0, 1, 0, 0);
	var post = usuario;

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
}

//*****Pega Info do Usuario Logado*****//
function pegaInfoUsuarioLogado(req, callback) {
	connection.query('SELECT * FROM Pessoa WHERE ID = ?', req.session.usuarioLogado.ID, function(err, rows, fields) {
		if(!err) {
			//Retrieve info do DB
			req.session.usuarioLogado.FatorK = rows[0].FatorK;
			req.session.usuarioLogado.Posicao = rows[0].Posicao;
			req.session.usuarioLogado.ListaNegra = rows[0].ListaNegra;
			req.session.usuarioLogado.Admin = rows[0].Admin;
			
			//Realiza o callback
			callback();
		} else {
			console.log('Error while performing Query (PEGA INFO DB)');
		}
	});
}

//*****Adiciona Evento ao DB*****//
function criarEventoDB(data, callback) {
	connection.query('INSERT INTO Evento SET ?', data, function(err, rows, fields) {
		if(!err) {
			callback(true);
		} else {
			console.log(err);
			callback(false);
		}
	});
}

//******Get Eventos*****//
function getEventos(callback) {
	connection.query('SELECT * FROM Evento', function(err, rows, fields) {
		if(!err) {
			//Retorna o inverso do array, para mostrar pela ordem de criacao
			callback(rows.reverse());
		} else {
			console.log(err);
			callback(false);
		}
	});
}

//*****Printa Tabela*****//
function printTabela(tabela) {
	connection.query('SELECT * FROM ??', [tabela], function(err, rows, fields) {
		if(!err) {
			console.log(rows);
		} else {
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
				} else {
					if(rows[i].FatorK == rows[i - 1].FatorK) {
						connection.query('UPDATE Pessoa SET Posicao = ? WHERE ID = ?', [rows[i - 1].Posicao, rows[i].ID]);
						rows[i].Posicao = rows[i - 1].Posicao;
					} else {
						connection.query('UPDATE Pessoa SET Posicao = ? WHERE ID = ?', [(i + 1), rows[i].ID]);
						rows[i].Posicao = i + 1;
					}
				}
			}

			console.log(rows);
			callback(rows);
		} else {
			console.log('Error while performing Query (MONTA RANKING)');
			console.log(err);
		}
	});
}

/*************************INICIA SERVIDOR*****************************/
app.listen(3000);