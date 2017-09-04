/********************************SETUP**********************************/
var http			= require('http');
var fs				= require('fs');
var url				= require('url');
var path			= require('path');
var express			= require('express');
var mysql			= require('mysql');
var bodyParser		= require('body-parser');
var session			= require('express-session');
var app 			= express();

//*****MySQL*****//
var connection;
var db_config = {
	host	: 'us-cdbr-iron-east-05.cleardb.net',
	user	: 'b8da9162116c36',
	password: '321c299a',
	database: 'heroku_d85ec50b8eb7067'
};

//Conecta ao Banco de Dados
function handleDisconnect() {
	console.log('1. connecting to db:');
	connection = mysql.createConnection(db_config);

	connection.connect(function(err) {
		if(err) {
			console.log('2. error when connecting to db:', err);
			setTimeout(handleDisconnect, 1000);
		}
	});

	connection.on('error', function(err) {
		console.log('3. db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

//Inicia DB
handleDisconnect();

//*****DEPENDENCIAS*****//
//Utilizar o BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Utilizar o express-session
app.use(session({secret: 'S3NH4'}));

//Utilizar o express-static
app.use(express.static('./', {
	index: 'html/login/index.html'
}));

/*********************************PAGINAS********************************/
var index = '/html/index.html';
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
	criarEventoDB(req, req.body, function(status) {
		res.send(status);
	});
});

//*****Editar Evento*****//
app.post("/editar-evento", function(req, res) {
	editarEventoDB(req, req.body, function(status) {
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
		res.send(status);
	});
});

//*****Cancelar Evento*****//
app.post("/cancelar-evento", function(req, res) {	
	cancelarEventoDB(req.body, function(status) {
		res.send(status);
	});
});

//*****Finalizar Evento*****//
app.post("/finalizar-evento", function(req, res) {
	finalizarEventoDB(req, req.body, function(status) {
		res.send(status);
	});
});

//*****Excluir Evento*****//
app.post("/excluir-evento", function(req, res) {
	excluirEventoDB(req, req.body, function(status) {
		res.send(status);
	});
});

//*****Criar Postagem*****//
app.post("/criar-postagem", function(req, res) {
	criarPostagemDB(req, req.body, function(status) {
		res.send(status);
	});
});

//*****Get Postagem*****//
app.get("/get-postagem", function(req, res) {
	getPostagemDB(function(status) {
		res.send(status);
	});
});

//*****Ranking*****//
app.get("/ranking", function(req, res) {
	montaRanking(function callback(rows) {
		res.send(rows);
	});
});

//*****Log Out*****//
app.get("/logout", function(req, res) {
	//Usuario deslogado
	req.session.loginSucesso = false;
	//Deleta session
	delete req.session.usuarioLogado;
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
	connection.query('INSERT IGNORE INTO pessoa SET ?', post, function(err, rows, fields) {
		if(!err) {
			// console.log(rows);
		}
		else {
			// console.log(err);
			// console.log('Error while performing Query (ADICIONA AO DB PESSOAS)');
		}
	});
}

//*****Pega Info do Usuario Logado*****//
function pegaInfoUsuarioLogado(req, callback) {
	connection.query('SELECT * FROM pessoa WHERE ID = ?', req.session.usuarioLogado.ID, function(err, rows, fields) {
		if(!err) {
			//Retrieve info do DB
			req.session.usuarioLogado.FatorK = rows[0].FatorK;
			req.session.usuarioLogado.Posicao = rows[0].Posicao;
			req.session.usuarioLogado.ListaNegra = rows[0].ListaNegra;
			req.session.usuarioLogado.Admin = rows[0].Admin;
			
			//Realiza o callback
			callback();
		} else {
			// console.log('Error while performing Query (PEGA INFO DB)');
		}
	});
}

//*****Adiciona Evento ao DB*****//
function criarEventoDB(req, data, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('INSERT INTO evento SET ?', data, function(err, rows, fields) {
			if(!err) {
				callback(true);
			} else {
				// console.log(err);
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Editar Evento no DB*****//
function editarEventoDB(req, data, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('UPDATE evento SET ? WHERE ID = ?', [data, data.ID], function(err, rows, fields) {
			if(!err) {
				callback(true);
			} else {
				// console.log(err);
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Get Eventos*****//
function getEventos(callback) {
	connection.query('SELECT * FROM evento', function(err, rows, fields) {
		if(!err) {
			//Retorna o inverso do array, para mostrar pela ordem de criacao
			callback(rows.reverse());
		} else {
			//console.log(err);
			callback(false);
		}
	});
}

//*****Get Confirmados*****//
function getConfirmados(data, callback) {
	//Get os IDs dos confirmados com INNER JOIN
	connection.query('SELECT ID, Nome, FatorK, `pessoa-evento`.ListaEspera, `pessoa-evento`.Colocacao, `pessoa-evento`.DataInscricao FROM `pessoa` INNER JOIN `pessoa-evento` ON pessoa.ID = `pessoa-evento`.IDPessoa WHERE `pessoa-evento`.IDEvento = ? ORDER BY `pessoa-evento`.Colocacao', data, function(err, rows, fields) {
		if(!err) {
			callback(rows);
		} else {
			//console.log('this.sql', this.sql);
			//console.log(err);
			callback(false);
		}
	});
}

//*****Get Confirmados Por Mim*****//
function getConfirmadosPorMim(data, callback) {
	connection.query('SELECT ID, Nome FROM `evento` INNER JOIN `pessoa-evento` ON evento.ID = `pessoa-evento`.IDEvento WHERE `pessoa-evento`.IDPessoa = ? ORDER BY ID DESC', data, function(err, rows, fields) {
		if(!err) {
			callback(rows);
		} else {
			//console.log('this.sql', this.sql);
			//console.log(err);
			callback(false);
		}
	});
}

//*****Confirmar Evento DB*****//
function confirmarEventoDB(data, callback) {
	var post;
	
	//Verifica se evento esta disponivel para inscricao
	estaDisponivel(data.evento, function(status) {
		//Se esta disponivel
		if(status) {
			//Verifica se o cara ta logado mesmo
			if(data.usuario) {
				//Verifica se o cara nao ja esta inscrito
				estaInscrito(data, function(status) {
					//Se nao esta inscrito
					if(status) {
						//Pega o numero de inscritos no evento
						connection.query('SELECT * FROM `pessoa-evento` INNER JOIN `evento` ON `evento`.ID = `pessoa-evento`.IDEvento WHERE IDEvento = ?', data.evento, function(err, rows, fields) {
							var max = (rows[0]) ? rows[0].NumeroMax : 1;
							var espera = ((rows.length + 1) > max) ? 1 : 0;
							
							//Seta o post
							post = {
								IDPessoa: data.usuario,
								IDEvento: data.evento,
								Colocacao: (rows.length + 1),
								ListaEspera: espera,
								dataInscricao: new Date().toUTCString()
							}
							
							//Adiciona pessoa ao evento
							connection.query('INSERT INTO `pessoa-evento` SET ?', post, function(err, rows, fields) {
								if(!err) {
									callback(true);
								} else {
									//console.log('this.sql', this.sql);
									//console.log(err);
									callback(false);
								}
							});
						});
					} else {
						callback(false);
					}
				});
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
}

//*****Cancelar Evento*****//
function cancelarEventoDB(post, callback) {
	if(post.usuario) {
		connection.query('DELETE FROM `pessoa-evento` WHERE IDEvento = ? AND IDPessoa = ?', [post.evento, post.usuario], function(err, rows, fields) {
			if(!err) {
				//Atualiza posicao do ranking
				connection.query('SELECT * FROM `pessoa-evento` WHERE IDEvento = ? ORDER BY Colocacao ASC', [post.evento, post.usuario], function(err, rows, fields) {
					if(!err) {
						//Atualiza a posicao no ranking
						for(var i = 0; i < rows.length; i++) {
							//Verifica se esta na lista de espera
							var espera;
							((i + 1) > post.max) ? espera = 1 : espera = 0;
							
							connection.query('UPDATE `pessoa-evento` SET Colocacao = ?, ListaEspera = ? WHERE IDPessoa = ? AND IDEvento = ?', [i + 1, espera, rows[i].IDPessoa, post.evento]);
						}
					}
					
					callback(true);
				});
			} else {
				//console.log('Error while performing Query');
				//console.log(err);
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Finalizar Evento*****//
function finalizarEventoDB(req, post, callback) {
	var controle = true;
	
	if(req.session.usuarioLogado.Admin) {
		var promessa = new Promise(function(resolve, reject) {
			post.pessoas.forEach(function(elem, index, array) {
				connection.query('UPDATE `pessoa` SET FatorK = FatorK + ? WHERE ID = ?', [post.fatork, elem], function(err, rows, fields) {
					if(!err) {
						//Se for o ultimo, resolve a promessa
						if(index == (array.length - 1)) {
							resolve();
						}
					} else {
						controle = false;
					}
				});
			});		
		});
		
		promessa.then(function() {
			connection.query('UPDATE `evento` SET Finalizado = 1 WHERE ID = ?', post.eventoID, function(err, rows, fields) {
				if(!err) {
					callback(controle);
				} else {
					controle = false;
				}
			});
		});
	} else {
		callback(false);
	}
}

//*****Excluir Evento*****//
function excluirEventoDB(req, post, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('DELETE FROM `evento` WHERE ID = ?', post.ID, function(err, rows, fields) {
			if(!err) {
				connection.query('DELETE FROM `pessoa-evento` WHERE IDEvento = ?', post.ID, function(err, rows, fields) {
					if(!err) {
						callback(true);
					} else {
						callback(false);
					}
				});			
			} else {
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Criar Postagem*****//
function criarPostagemDB(req, data, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('INSERT INTO postagem SET ?', data, function(err, rows, fields) {
			if(!err) {
				callback(true);
			}
			else {
				//console.log(err);
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Get Postagem*****//
function getPostagemDB(callback) {
	connection.query('SELECT postagem.*, evento.Nome FROM postagem LEFT JOIN evento ON postagem.EventoID = evento.ID', function(err, rows, fields) {
		if(!err) {
			callback(rows);
		}
		else {
			//console.log(err);
			callback(false);
		}
	});
}

//*****Esta Inscrito*****//
function estaInscrito(post, callback) {	
	connection.query('SELECT * FROM `pessoa-evento` WHERE IDPessoa = ? AND IDEvento = ?', [post.usuario, post.evento], function(err, rows, fields) {
		if(!err) {
			//Se esta ou nao inscrito
			rows.length == 0 ? callback(true) : callback(false);
		} else {
			//console.log('Error while performing Query');
			callback(false);
		}
	});
}

//*****Esta Disponivel*****//
function estaDisponivel(evento, callback) {
	connection.query('SELECT DataInscricao, FimInscricao FROM `evento` WHERE ID = ?', evento, function(err, rows, fields) {
		if(!err) {
			var dataEvento = rows[0].DataInscricao;
			var dataFim = rows[0].FimInscricao;
			var dataCountdown = new Date(dataEvento).getTime();
			var dataCountdown2 = new Date(dataFim).getTime();
			var agora = new Date(new Date().toUTCString().replace(" GMT", "")).getTime();
			var distancia = dataCountdown - agora;
			var distancia2 = agora - dataCountdown2;
			
			(distancia <= 0 && distancia2 <= 0) ? callback(true) : callback(false);
		} else {
			//console.log('Error while performing Query');
			//console.log(err);
			callback(false);
		}
	});
}

//*****Printa Tabela*****//
function printTabela(tabela) {
	connection.query('SELECT * FROM ??', [tabela], function(err, rows, fields) {
		if(!err) {
			//console.log(rows);
		} else {
			//console.log('Error while performing Query (PRINTA TABELA)');
		}
	});
}

//*****Monta Ranking*****//
function montaRanking(callback) {
	connection.query('SELECT ID, Nome, FatorK FROM pessoa ORDER BY FatorK DESC', function(err, rows, fields) {
		if(!err) {
			//Atualiza a posicao no ranking
			for(var i = 0; i < rows.length; i++) {
				if(i == 0) {
					connection.query('UPDATE pessoa SET Posicao = 1 WHERE ID = ?', rows[0].ID);
					rows[0].Posicao = 1;
				} else {
					if(rows[i].FatorK == rows[i - 1].FatorK) {
						connection.query('UPDATE pessoa SET Posicao = ? WHERE ID = ?', [rows[i - 1].Posicao, rows[i].ID]);
						rows[i].Posicao = rows[i - 1].Posicao;
					} else {
						connection.query('UPDATE pessoa SET Posicao = ? WHERE ID = ?', [(i + 1), rows[i].ID]);
						rows[i].Posicao = i + 1;
					}
				}
			}

			callback(rows);
		} else {
			//console.log('Error while performing Query (MONTA RANKING)');
			//console.log(err);
		}
	});
}

/*************************INICIA SERVIDOR*****************************/
var port = process.env.PORT || 3000;

app.listen(port, function() {
	//console.log("Ouvindo na porta " + port);
});