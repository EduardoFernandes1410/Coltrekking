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
	host	: 'us-cdbr-iron-east-03.cleardb.net',
	user	: 'bae2902327afa9',
	password: 'aa09eff1',
	database: 'heroku_c4f1d12a0ffd9dd'
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

//*****Post Confirmados*****//
app.post("/confirmados", function(req, res) {
	getConfirmados(req.body.IDEvento, function(rows) {
		res.send(rows);
	});
});

//*****Post Confirmados por Mim*****//
app.post("/confirmados-por-mim", function(req, res) {
	getConfirmadosPorMim(req.body.usuarioID, function(rows) {
		res.send(rows);
	});
});

//*****Confirmar Evento*****//
app.post("/confirmar-evento", function(req, res) {
	confirmarEventoDB(req.body, function(status) {
		status ? console.log("Inscrição realizada com sucesso") : console.log("Erro ao realizar a inscrição");
		res.send(status);
	});
});

//*****Cancelar Evento*****//
app.post("/cancelar-evento", function(req, res) {	
	cancelarEventoDB(req.body, function(status) {
		status ? console.log("Cancelamento realizado com sucesso") : console.log("Erro ao cancelar a inscrição");
		res.send(status);
	});
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

//*****Get Eventos*****//
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

//*****Get Confirmados*****//
function getConfirmados(data, callback) {
	//Get os IDs dos confirmados com INNER JOIN
	connection.query('SELECT ID, Nome, FatorK, `Pessoa-Evento`.ListaEspera, `Pessoa-Evento`.Colocacao FROM `Pessoa` INNER JOIN `Pessoa-Evento` ON Pessoa.ID = `Pessoa-Evento`.IDPessoa WHERE `Pessoa-Evento`.IDEvento = ?', data, function(err, rows, fields) {
		if(!err) {
			console.log(rows);
			callback(rows);
		} else {
			console.log('this.sql', this.sql);
			console.log(err);
			callback(false);
		}
	});
}

//*****Get Confirmados Por Mim*****//
function getConfirmadosPorMim(data, callback) {
	connection.query('SELECT ID, Nome FROM `Evento` INNER JOIN `Pessoa-Evento` ON Evento.ID = `Pessoa-Evento`.IDEvento WHERE `Pessoa-Evento`.IDPessoa = ? ORDER BY ID DESC', data, function(err, rows, fields) {
		if(!err) {
			console.log(rows);
			callback(rows);
		} else {
			console.log('this.sql', this.sql);
			console.log(err);
			callback(false);
		}
	});
}

//*****Confirmar Evento DB*****//
function confirmarEventoDB(data, callback) {
	var post;
	
	//Pega o numero de inscritos no evento
	connection.query('SELECT * FROM `Pessoa-Evento` WHERE IDEvento = ?', data.evento, function(err, rows, fields) {
		//Seta o post
		post = {
			IDPessoa: data.usuario,
			IDEvento: data.evento,
			Colocacao: (rows.length + 1),
			ListaEspera: 0			
		}
		
		//Verifica se o cara nao esta inscrito
		estaInscrito(post, function(status) {
			//Se nao esta inscrito
			if(status) {
				//GET numero maximo de pessoas no Evento
				connection.query('SELECT NumeroMax FROM Evento WHERE ID = ?', data.evento, function(err, rows, fields) {
					var max = rows[0].NumeroMax;
					
					//Se esta na lista de espera
					(post.Colocacao > max) ? post.ListaEspera = 1 : post.ListaEspera = 0;
					
					//Adiciona pessoa ao evento
					connection.query('INSERT INTO `Pessoa-Evento` SET ?', post, function(err, rows, fields) {
						if(!err) {
							callback(true);
						} else {
							console.log('this.sql', this.sql);
							console.log(err);
							callback(false);
						}
					});
				});				
			} else {
				callback(false);
			}
			
		});
	});	
}

//*****Cancelar Evento*****//
function cancelarEventoDB(post, callback) {	
	connection.query('DELETE FROM `Pessoa-Evento` WHERE IDEvento = ? AND IDPessoa = ?', [post.evento, post.usuario], function(err, rows, fields) {
		if(!err) {
			//Atualiza posicao do ranking
			connection.query('SELECT * FROM `Pessoa-Evento` WHERE IDEvento = ? ORDER BY Colocacao ASC', [post.evento, post.usuario], function(err, rows, fields) {
				if(!err) {
					//Atualiza a posicao no ranking
					for(var i = 0; i < rows.length; i++) {
						//Verifica se esta na lista de espera
						var espera;
						((i + 1) > post.max) ? espera = 1 : espera = 0;
						
						connection.query('UPDATE `Pessoa-Evento` SET Colocacao = ?, ListaEspera = ? WHERE IDPessoa = ?', [i + 1, espera, rows[i].IDPessoa]);
					}
				}
				
				callback(true);
			});
		} else {
			console.log('Error while performing Query');
			console.log(err);
			callback(false);
		}
	});
}

//*****Esta Inscrito*****//
function estaInscrito(post, callback) {	
	connection.query('SELECT * FROM `Pessoa-Evento` WHERE IDPessoa = ? AND IDEvento = ?', [post.IDPessoa, post.IDEvento], function(err, rows, fields) {
		if(!err) {
			//Se esta ou nao inscrito
			rows.length == 0 ? callback(true) : callback(false);
		} else {
			console.log('Error while performing Query (PRINTA TABELA)');
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
var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log("Ouvindo na porta " + port);
});