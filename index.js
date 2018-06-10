/********************************SETUP**********************************/
var http			= require('http');
var fs				= require('fs');
var url				= require('url');
var path			= require('path');
var express			= require('express');
var mysql			= require('mysql');
var bodyParser		= require('body-parser');
var session			= require('express-session');
var aws				= require('aws-sdk');
var app 			= express();

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

//*****MySQL*****//
var pool = mysql.createPool({
	connectionLimit : 300,
	host	: 'sql9.freemysqlhosting.net',
	user	: 'sql9242044',
	password: 'mvyTtXJDEM',
	database: 'sql9242044',
	debug	: false
});

// Conecta ao DB
function handleDatabase(req, res, call) {
	pool.getConnection(function(err, connection){
		if(err) {
			res.json({"code": 100, "status": "Error in connection database"});
			return false;
		}
		
		call(req, res, connection);

		connection.on('error', function(err) {      
			//res.json({"code": 100, "status": "Error in query"});
			return false;
		});
	});
}

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
	if(!req.body.ID || req.body.ID.length < 5) {
		res.status(500);
		res.send("Problema com o firebase");
	} else {
		req.session.usuarioLogado = req.body;

		//Adiciona usuario ao DB
		handleDatabase(req, res, function(req, res, connection) {
			addDB(req, connection, function(status) {
				if(status) {
					req.session.loginSucesso = true;
					
					handleDatabase(req, res, function(req, res, connection) {
						//Pega info como fatork, posicao, etc
						pegaInfoUsuarioLogado(req, connection, function(status) {
							if (status) {
								//Depois de fazer login, manda pagina a ser redirecionado
								res.send("/main-page");
							} else {
								res.status(500);
								res.send("Algo inesperado aconteceu");
							}
						});
					});
				} else {
					res.status(500);
					res.send("Problema com o firebase");
				}
			});
		});

	}
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
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			criarEventoDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Editar Evento*****//
app.post("/editar-evento", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			editarEventoDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//******Get Eventos*****//
app.get("/eventos", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			getEventos(connection, function(rows) {
				res.send(rows);
			});
		});
	}
});

//*****Post Confirmados*****//
app.post("/confirmados", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			getConfirmados(req.body.IDEvento, connection, function(rows) {
				res.send(rows);
			});
		});
	}
});

//*****Post Confirmados por Mim*****//
app.post("/confirmados-por-mim", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			getConfirmadosPorMim(req.body.usuarioID, connection, function(rows) {
				res.send(rows);
			});
		});
	}
});

//*****Confirmar Evento*****//
app.post("/confirmar-evento", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			confirmarEventoDB(req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Cancelar Evento*****//
app.post("/cancelar-evento", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			cancelarEventoDB(req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Finalizar Evento*****//
app.post("/finalizar-evento", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			finalizarEventoDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});



//*****Finalizar Evento Prelecao - sem cadastrar fator k*****//
app.post("/finalizar-evento-prelecao", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			finalizarEventoPrelecaoDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});


//*****Adicionar usuario na lista negra*****//
app.post("/adicionar-lista-negra", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			adicionarListaNegraDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Remover usuario da lista negra*****//
app.post("/remover-lista-negra", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			removerListaNegraDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});


//*****Excluir Evento*****//
app.post("/excluir-evento", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			excluirEventoDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});


//*****Excluir Usuario*****//
app.post("/excluir-usuario", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			excluirUsuarioDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});


//*****Criar Postagem*****//
app.post("/criar-postagem", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			criarPostagemDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Excluir Postagem*****//
app.post("/excluir-postagem", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			excluirPostagemDB(req, req.body, connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Get Postagem*****//
app.get("/get-postagem", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			getPostagemDB(connection, function(status) {
				res.send(status);
			});
		});
	}
});

//*****Ranking*****//
app.get("/ranking", function(req, res) {
	if(!req.session.usuarioLogado.ID) {
		res.send(false);
	} else {
		handleDatabase(req, res, function(req, res, connection) {
			montaRanking(connection, function callback(rows) {
				res.send(rows);
			});
		});
	}
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
function addDB(req, connection, callback) {
	//Cria usuario com propriedades do req.session.usuarioLogado
	var usuario = new Usuario(req.session.usuarioLogado.Nome, req.session.usuarioLogado.Email, req.session.usuarioLogado.Foto, req.session.usuarioLogado.ID, 0, 1, 0, 0);

	//Adiciona ao DB de Pessoas
	connection.query('INSERT IGNORE INTO pessoa SET ?', usuario, function(err, rows, fields) {
		connection.release();
			
		if(!err) {
			// console.log(rows);
			callback(true);
		}
		else {
			// console.log(err);
			// console.log('Error while performing Query (ADICIONA AO DB PESSOAS)');
			callback(false);
		}
	});
}

//*****Pega Info do Usuario Logado*****//
function pegaInfoUsuarioLogado(req, connection, callback) {
	connection.query('SELECT * FROM pessoa WHERE ID = ?', req.session.usuarioLogado.ID, function(err, rows, fields) {
		connection.release();
		
		if(!err) {
			//Retrieve info do DB
			try {
				req.session.usuarioLogado.FatorK = rows[0].FatorK;
				req.session.usuarioLogado.Posicao = rows[0].Posicao;
				req.session.usuarioLogado.ListaNegra = rows[0].ListaNegra;
				req.session.usuarioLogado.Admin = rows[0].Admin;
			} catch(err) {
				console.log(err.message);
				callback(false);
			}
			
			//Realiza o callback
			callback(true);
		} else {
			callback(false);
			// console.log('Error while performing Query (PEGA INFO DB)');
		}
	});
}

//*****Adiciona Evento ao DB*****//
function criarEventoDB(req, data, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('INSERT INTO evento SET ?', data, function(err, rows, fields) {
			if(!err) {
				connection.query('UPDATE `pessoa` SET ListaNegra = 0 WHERE ListaNegra = 2', function(err, rows, fields) {
					if(!err) {
						connection.query('UPDATE `pessoa` SET ListaNegra = 2 WHERE ListaNegra = 1', function(err, rows, fields) {				
							if(!err) {
								connection.query('UPDATE `pessoa-evento` SET listaNegraEvento = 3 WHERE listaNegraEvento = 2', function(err, rows, fields) {
									if(!err) {
										connection.query('UPDATE `pessoa-evento` SET listaNegraEvento = 2 WHERE listaNegraEvento = 1', function(err, rows, fields) {
											connection.release();
		
											if(!err) {
												callback(true);
											}
											else {
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
						});	
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

//*****Editar Evento no DB*****//
function editarEventoDB(req, data, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('UPDATE evento SET ? WHERE ID = ?', [data, data.ID], function(err, rows, fields) {
			connection.release();
		
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
function getEventos(connection, callback) {
	connection.query('SELECT * FROM evento', function(err, rows, fields) {
		connection.release();
		
		if(!err) {
			//Retorna o inverso do array, para mostrar pela ordem de criacao
			let horaCorreta = new Date(new Date().toUTCString().replace(" GMT", ""));
			horaCorreta.setHours(horaCorreta.getHours() + 2);
			
			var retorno = {
				eventos: rows.reverse(),
				hora: horaCorreta.getTime()
			};
			
			callback(retorno);
		} else {
			//console.log(err);
			callback(false);
		}
	});
}

//*****Get Confirmados*****//
function getConfirmados(data, connection, callback) {
	//Get os IDs dos confirmados com INNER JOIN
	connection.query('SELECT ID, Nome, FatorK, `pessoa-evento`.ListaEspera, `pessoa-evento`.IDEvento, `pessoa-evento`.Colocacao, `pessoa-evento`.DataInscricao, `pessoa-evento`.listaNegraEvento FROM `pessoa` INNER JOIN `pessoa-evento` ON pessoa.ID = `pessoa-evento`.IDPessoa WHERE `pessoa-evento`.IDEvento = ? ORDER BY `pessoa-evento`.DataHoraInscricao, `pessoa-evento`.Colocacao', data, function(err, rows, fields) {
		connection.release();
		
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
function getConfirmadosPorMim(data, connection, callback) {
	connection.query('SELECT ID, Nome FROM `evento` INNER JOIN `pessoa-evento` ON evento.ID = `pessoa-evento`.IDEvento WHERE `pessoa-evento`.IDPessoa = ? ORDER BY ID DESC', data, function(err, rows, fields) {
		connection.release();
		
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
function confirmarEventoDB(data, connection, callback) {
	var post;
	
	//Verifica se evento esta disponivel para inscricao
	estaDisponivel(data.evento, connection, function(status) {
		//Se esta disponivel
		if(status) {
			//Verifica se o cara ta logado mesmo
			if(data.usuario) {
				//Verifica se o cara nao ja esta inscrito
				estaInscrito(data, connection, function(status) {
					//Se nao esta inscrito
					if(status) {							
						var datetime = new Date().toISOString();
						datetime = datetime.split('T');
						datetime[1] = datetime[1].split('.')[0];
						datetime = datetime.join(' ');
						
						//Seta o post
						post = {
							IDPessoa: data.usuario,
							IDEvento: data.evento,
							Colocacao: 0,
							ListaEspera: 0,
							DataInscricao: new Date().toUTCString(),
							DataHoraInscricao: datetime
						};

						//verifica se o usuario nao esta na lista negra
						if(data.blacklist == 0) {
							//Adiciona pessoa ao evento
							connection.query('INSERT INTO `pessoa-evento` SET ?', post, function(err, rows, fields) {
								if(!err) {
									connection.release();
									callback(true);
								} else {
									//console.log('this.sql', this.sql);
									//console.log(err);
									callback(false);
								}
							});
						}
						else{
							callback(false);
						}
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
function cancelarEventoDB(post, connection, callback) {
	if(post.usuario) {
		connection.query('DELETE FROM `pessoa-evento` WHERE IDEvento = ? AND IDPessoa = ?', [post.evento, post.usuario], function(err, rows, fields) {
			if(!err) {
				connection.release();
				callback(true);
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
function finalizarEventoDB(req, post, connection, callback) {
	var controle = true;
	
	

	if(req.session.usuarioLogado.Admin) {
		var promessa = new Promise(function(resolve, reject) {
			post.pessoas.forEach(function(elem, index, array) {

				connection.query('UPDATE `evento` SET fatorKevento = ? WHERE ID = ?', [post.fatork, post.eventoID], function(err, rows, fields) {
				});
				connection.query('UPDATE `evento` SET subdesc = ? WHERE ID = ?',  [post.subdesc, post.eventoID], function(err, rows, fields) {
				});

				connection.query('UPDATE `evento` SET distancia = ? WHERE ID = ?',  [post.distancia, post.eventoID], function(err, rows, fields) {
				});

				connection.query('UPDATE `pessoa-evento` SET fatorKPessoaEvento = ? WHERE IDEvento = ? AND listaNegraEvento = 0',  [post.fatork, post.eventoID], function(err, rows, fields) {
				});
				connection.query('UPDATE `pessoa` SET FatorK = (SELECT SUM(FatorKPessoaEvento) FROM `pessoa-evento` WHERE IDPessoa = ?) WHERE ID = ?',  [elem,elem], function(err, rows, fields) {
				});
				connection.query('UPDATE `evento` SET Finalizado = 1 WHERE ID = ?', [post.eventoID], function(err, rows, fields) {
				});
				
			});		
		});
		promessa.then(function() {
			connection.release();
		});
	
	} else {
		callback(false);
	}
}




//*****Finalizar Evento Prelecao - Sem cadastrar fator k*****//
function finalizarEventoPrelecaoDB(req, post, connection, callback) {	
	if(req.session.usuarioLogado.Admin) {
		connection.query('UPDATE `evento` SET Finalizado = 1 WHERE ID = ?', post.eventoID, function(err, rows, fields) {
			connection.release();
		
			if(!err) {
				callback(true);
			}
			else {
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}




/**
 	Na tabela `pessoa`, quando o admin adiciona um usuario a lista negra, a coluna "ListaNegra" recebe 1.
	Na tabela `pessoa`, quando o admin cria um evento, todos que possui 1 na "ListaNegra" recebe o numero 2
	E todos que possuem que possui 2 na "ListaNegra" recebe 0 (saem da lista negra)
	Usuarios que nao possuirem 0, nao poderam se inscrever em nenhum evento
	
	Na tabela `pessoa-evento`, o usuario terá 1 na coluna "listaNegraEvento" quando o admin adiciona-la na lista negra
	Na tabela `pessoa-evento`, o usuario terá 2 na coluna "listaNegraEvento" quando o um evento for criado.
	Quando a coluna "listaNegraEvento" for = 1, então a situacao do usuario eh bloqueado
	Quando a coluna "listaNegraEvento" for = 2, então a situacao do usuario eh livre
**/
//*****Adicionar usuario na lista negra*****//
function adicionarListaNegraDB(req, post, connection, callback) {	
	if(req.session.usuarioLogado.Admin) {
		connection.query('UPDATE `pessoa-evento` SET listaNegraEvento = 1 WHERE IDEvento = ? AND IDPessoa = ?', [post.IDEvento, post.ID], function(err, rows, fields) {
			if(!err) {
				connection.query('UPDATE `pessoa` SET ListaNegra = 1 WHERE ID = ?', post.ID, function(err, rows, fields) {
					connection.release();
		
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


/**
	Remover usuario da lista negra
**/
function removerListaNegraDB(req, post, connection, callback) {	
	if(req.session.usuarioLogado.Admin) {
		connection.query('UPDATE `pessoa-evento` SET listaNegraEvento = 0 WHERE IDEvento = ? AND IDPessoa = ?', [post.IDEvento, post.ID], function(err, rows, fields) {
			if(!err) {
				connection.query('UPDATE `pessoa` SET ListaNegra = 0 WHERE ID = ?', post.ID, function(err, rows, fields) {
					connection.release();
		
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






//*****Excluir Evento*****//
function excluirEventoDB(req, post, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('DELETE FROM `evento` WHERE ID = ?', post.ID, function(err, rows, fields) {
			if(!err) {
				connection.query('DELETE FROM `pessoa-evento` WHERE IDEvento = ?', post.ID, function(err, rows, fields) {
					connection.release();
		
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


//*****Excluir Usuario*****//
function excluirUsuarioDB(req, post, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('DELETE FROM `pessoa-evento` WHERE IDEvento = ? AND IDPessoa = ?', [post.IDEvento, post.ID], function(err, rows, fields) {
			connection.release();

			if(!err) {
				callback(true);
			} else {
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}



//*****Criar Postagem*****//
function criarPostagemDB(req, data, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('INSERT INTO postagem SET ?', data, function(err, rows, fields) {
			connection.release();
		
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
function getPostagemDB(connection, callback) {
	connection.query('SELECT postagem.*, evento.Nome, pessoa.Nome AS AdminNome, pessoa.Foto AS AdminFoto FROM postagem LEFT JOIN evento ON postagem.EventoID = evento.ID LEFT JOIN pessoa ON postagem.AdminID = pessoa.ID', function(err, rows, fields) {
		connection.release();
		
		if(!err) {
			callback(rows);
		}
		else {
			//console.log(err);
			callback(false);
		}
	});
}

//*****Excluir Postagem*****//
function excluirPostagemDB(req, post, connection, callback) {
	if(req.session.usuarioLogado.Admin) {
		connection.query('DELETE FROM `postagem` WHERE ID = ?', post.ID, function(err, rows, fields) {
			connection.release();

			if(!err) {
				callback(true);
			} else {
				callback(false);
			}
		});
	} else {
		callback(false);
	}
}

//*****Esta Inscrito*****//
function estaInscrito(post, connection, callback) {	
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
function estaDisponivel(evento, connection, callback) {
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
function printTabela(connection, tabela) {
	connection.query('SELECT * FROM ??', [tabela], function(err, rows, fields) {
		connection.release();
		
		if(!err) {
			//console.log(rows);
		} else {
			//console.log('Error while performing Query (PRINTA TABELA)');
		}
	});
}

//*****Monta Ranking*****//
function montaRanking(connection, callback) {
	connection.query('SELECT ID, Nome, FatorK FROM pessoa WHERE (FatorK > 0) ORDER BY FatorK DESC', function(err, rows, fields) {
		var numRows = rows.length;
		
		if(!err) {
			var iteracao = 0;
			//Atualiza a posicao no ranking
			var promessa = new Promise(function(resolve, release) {
				for(var i = 0; i < rows.length; i++) {
					if(i == 0) {
						connection.query('UPDATE pessoa SET Posicao = 1 WHERE ID = ?', rows[0].ID);
						rows[0].Posicao = 1;
					} else {
						if(rows[i].FatorK == rows[i - 1].FatorK) {
							connection.query('UPDATE pessoa SET Posicao = ? WHERE ID = ?', [rows[i - 1].Posicao, rows[i].ID], function(err, rows, fields) {
								iteracao++;

								if(iteracao == numRows) {
									resolve();
								}
							});
							rows[i].Posicao = rows[i - 1].Posicao;
						} else {
							connection.query('UPDATE pessoa SET Posicao = ? WHERE ID = ?', [(i + 1), rows[i].ID], function(err, rows, fields) {
								iteracao++;

								if(iteracao == numRows) {
									resolve();
								}
							});
							rows[i].Posicao = i + 1;
						}
					}
				}

				callback(rows);
			});
			
			promessa.then(function() {
				connection.release();
			});
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