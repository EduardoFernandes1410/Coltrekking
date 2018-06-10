(function() {
	var app = angular.module('main', ['ngRoute', 'ngSanitize']);

//**********Middleware**********//
	app.run(['$rootScope', '$location', 'HTTPService', function($rootScope, $location, httpService) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			var admin;
			
			//Pega permissao de admin de usuario logado
			httpService.get('/get-user', function(usuario) {
				this.admin = usuario.Admin;

				//Se nao estiver logado
				if(!usuario) {
					$location.path('/logout');
				}

				//Se for admin
				if(this.admin) {
					//Se for pra MAIN-PAGE
					if(!next.templateUrl) {
						$location.path('/');
					}
					if(next.templateUrl == "../html/create/event.html") {
						$location.path('/create-event');
					}
				} else {
					event.preventDefault();
					$location.path('/');
				}
			});
		});
	}]);

//**********Navegacao**********//
	app.config(function($routeProvider) {
		$routeProvider
		.when("/create-event",
			{
				templateUrl: "../html/create/event.html",
				controller: "CriarEventoController"
			}
		)
		.when("/create-news",
			{
				templateUrl: "../html/create/news.html",
				controller: "CriarPostsController"
			}
		)
		.otherwise(
			{
				//redirectTo: "/"
			}
		);
	});

//**********Servicos**********//
	//HTTPService
	app.factory('HTTPService', function($http) {
		var httpService = {};
		
		//GET
		httpService.get = function(urlGet, callback) {
			$http.get(urlGet).then(function successCallback(response) {
				//Sucesso
				callback(response.data);
			}, function errorCallback(response) {
				//Erro
				callback(null);
			});
		}
		
		//POST
		httpService.post = function(urlPost, data, callback) {
			$http.post(urlPost, data).then(function successCallback(response) {
				//Sucesso
				callback(response.data);
			}, function errorCallback(response) {
				//Erro
				callback(null);
			});
		}
		
		return httpService;
	});
	
	
	//EventosService
	app.factory('EventosService', function() {
		var eventosService = {};		
		var eventos;
		
		eventosService.get = function() {
			return eventos;
		}
		
		eventosService.set = function(data) {
			eventos = data;
		}
		
		return eventosService;
	});

//**********Controles**********//
	//Login Controller
	app.controller('LoginController', ['HTTPService', '$rootScope', function(httpService, $rootScope) {
		var usuarioLogado;

		//Chama Login
		httpService.get('/get-user', function(answer) {
			if(answer != null) {
				this.usuarioLogado = answer;
				//Salva no rootScope para uso posterior
				$rootScope.usuario = answer;
				//Inicializa eventos
				$rootScope.$broadcast('InicializarEventos', true);
			}
		}.bind(this));
	}]);


	//Route Controller
	app.controller('RouteController', function($scope, $location) {
		$scope.$location = $location;
	});


	//CriarEventos Controller
	app.controller('CriarEventoController', ['HTTPService', '$timeout', '$scope', '$location', '$window', '$rootScope', function(httpService, $timeout, $scope, $location, $window, $rootScope) {
		//Modo Edicao
		$scope.modoEdicao = !jQuery.isEmptyObject($location.search());
		
		//Parametros enviados por GET
		if($scope.modoEdicao) {
			$scope.eventoAttr = $location.search();
			$scope.eventoAttr.numeroMax = parseInt($scope.eventoAttr.numeroMax);
			$scope.eventoAttr.dataInscricao += " GMT";
			$scope.eventoAttr.fimInscricao += " GMT";
			
			//Arruma a data de inscricao
			var data = new Date($scope.eventoAttr.dataInscricao);
			$scope.eventoAttr.dataHora = (data.getHours() >= 10 ? data.getHours() : "0" + data.getHours()) + ":" + (data.getMinutes() >= 10 ? data.getMinutes() : "0" + data.getMinutes());
			$scope.eventoAttr.dataDia = data.getDate() >= 10 ? data.getDate() : "0" + data.getDate();
			$scope.eventoAttr.dataDia += "/" + ((data.getMonth() + 1) >= 10 ? (data.getMonth() + 1) : "0" + (data.getMonth() + 1));
			$scope.eventoAttr.dataDia += "/" + data.getFullYear();
			
			//Arruma a data do fim da inscricao
			var dataFim = new Date($scope.eventoAttr.fimInscricao);
			$scope.eventoAttr.dataFimHora = (dataFim.getHours() >= 10 ? dataFim.getHours() : "0" + dataFim.getHours()) + ":" + (dataFim.getMinutes() >= 10 ? dataFim.getMinutes() : "0" + dataFim.getMinutes());
			$scope.eventoAttr.dataFimDia = dataFim.getDate() >= 10 ? dataFim.getDate() : "0" + dataFim.getDate();
			$scope.eventoAttr.dataFimDia += "/" + ((dataFim.getMonth()) + 1 >= 10 ? (dataFim.getMonth() + 1) : "0" + (dataFim.getMonth() + 1));
			$scope.eventoAttr.dataFimDia += "/" + dataFim.getFullYear();
			
			//Seta os selects
			$scope.params = {};
			$scope.params.Tipo = $scope.eventoAttr.tipo;
			$scope.params.TipoTrekking = $scope.eventoAttr.tipoTrekking;
			$scope.params.Dificuldade = $scope.eventoAttr.dificuldade;
		}
		
		//Inicia
		$timeout(function() {
			//Inicializa elementos do Materialize
			$(document).ready(function() {
				//Select
				$('select').material_select();

				
				//Date-Picker
				$('.datepicker').pickadate({
					monthsFull: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
					monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
					weekdaysFull: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabádo'],
					weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
					today: 'Hoje',
					clear: 'Limpar',
					close: 'Pronto',
					labelMonthNext: 'Próximo mês',
					labelMonthPrev: 'Mês anterior',
					labelMonthSelect: 'Selecione um mês',
					labelYearSelect: 'Selecione um ano',
					selectMonths: true,
					selectYears: 2,
					format: 'dd/mm/yyyy'
				});
				
				//Time-Picker
				$('.timepicker').pickatime({
					default: 'now', // Set default time
					fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
					twelvehour: false, // Use AM/PM or 24-hour format
					donetext: 'OK', // text for done-button
					cleartext: 'Limpar', // text for clear-button
					canceltext: 'Cancelar', // Text for cancel-button
					autoclose: false, // automatic close timepicker
					ampmclickable: true, // make AM PM clickable
					aftershow: function(){} //Function for after opening timepicker  
				});
				
				//MODO EDICAO
				//Verifica se esta no modo de edicao
				if($scope.modoEdicao) {					
					//Edita os valores dos elementos
					$("#titulo").text("Editar \"" + $scope.eventoAttr.nome + "\"");
					$("#nome").val($scope.eventoAttr.nome);
					$("#tipo").val($scope.eventoAttr.tipo);
					
					if($scope.eventoAttr.tipoTrekking != "null") {
						$("#tipoTrekking").val($scope.eventoAttr.tipoTrekking);
						$("#tipoTrekking").prop('disabled', false);
					}
					
					if($scope.eventoAttr.dificuldade != "null") {
						$("#dificuldade").val($scope.eventoAttr.dificuldade);
						$("#dificuldade").prop('disabled', false);
					}
					
					if($scope.eventoAttr.tipo == "3") {
						$("#dataFim").attr("disabled", false);
					}

					$("#dataInicio").val($scope.eventoAttr.dataInicio);
					$("#dataFim").val($scope.eventoAttr.dataFim);
					$("#numeroMax").val($scope.eventoAttr.numeroMax);
					$("#dataInscricao").val($scope.eventoAttr.dataDia);
					$("#horarioInscricao").val($scope.eventoAttr.dataHora);
					$("#local").val($scope.eventoAttr.local);
										
					//Reinicia os elementos Materialize
					Materialize.updateTextFields();
					$('select').material_select();
				}
			});
		});

		//Arruma os parametros
		function arrumaParametros(params) {
			//Verifica tipo de evento
			if(params.Tipo == 1) { //se for prelecao
				params.Dificuldade = null;
			}
			
			if(params.Tipo != 2) { //se nao for trekking
				params.TipoTrekking = null;
			}
			
			//Seta data de inscricao
			params.DataInscricao = params.DataInscricao.split("/").reverse().join("-");
			params.DataInscricao += 'T' + params.HorarioInscricao + ":00";
			params.DataInscricao = new Date(params.DataInscricao).toUTCString().replace(" GMT", "");
			
			//Seta fim da inscricao
			params.FimInscricao = params.DataFimInscricao.split("/").reverse().join("-");
			params.FimInscricao += 'T' + params.HorarioFimInscricao + ":00";
			params.FimInscricao = new Date(params.FimInscricao).toUTCString().replace(" GMT", "");
			
			//Deleta params inuteis
			delete params.HorarioInscricao;
			delete params.DataFimInscricao;
			delete params.HorarioFimInscricao;			
			
			//Retorna os parametros arrumados
			return params;
		}

		//Submit o formulario de CRIAR EVENTO
		$scope.criarEvento = function(params) {
			//Arruma os parametros
			params = arrumaParametros(params);
			
			//Chama o POST Criar Evento
			httpService.post('/criar-evento', params, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Evento criado com sucesso!", 2000);
					$location.path('/');
					
					//Recarrega os eventos
					$rootScope.$broadcast('RecarregarEventos', true);
				} else {
					Materialize.toast("Erro ao criar o evento!", 3000);
				}
			});
		}
		
		//Submit o formulario de CRIAR EVENTO
		$scope.editarEvento = function(params) {
			//Arruma os parametros
			params = arrumaParametros(params);			
			//Pega o ID do evento
			params.ID = $location.search().id;
						
			//Chama o POST Criar Evento
			httpService.post('/editar-evento', params, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Evento editado com sucesso!", 2000);
					$location.url($location.path('/main-page'));
					
					//Recarrega os eventos
					$rootScope.$broadcast('RecarregarEventos', true);
				} else {
					Materialize.toast("Erro ao editar o evento!", 3000);
				}
			});
		}
	}]);


	//Eventos Controller
	app.controller('EventosController', ['HTTPService', 'EventosService', '$timeout', '$rootScope', '$scope', '$interval', '$window', '$location',  function(httpService, eventosService, $timeout, $rootScope, $scope, $interval, $window, $location) {
		//Funcao Countdown
		$scope.funcaoCountdown = function(element, dataCountdown, controle) {
			var agora = $scope.horaServidor;
			var distancia = dataCountdown - agora - 3600000; //-36000 Milissegundo pois os eventos estavam 1 hora adiantado e nao consegui achar o problema, por isso -36000 Milissegundo  (1 hora)
			
			//Transforma distancia em d h m s
			var days = Math.floor(distancia / (1000 * 60 * 60 * 24));
			var hours = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			var minutes = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((distancia % (1000 * 60)) / 1000);
			
			var string = days + " dias " + hours + " horas " + minutes + " min " + seconds + " seg ";
			
			//Transforma distancia em string
			if(controle) {
				element.Countdown = string;
			} else {
				element.CountdownDisponibilidade = string;
			}
			
			//Confere se acabou o tempo
			if(distancia <= 0) {
				if(controle) {
					element.Disponivel = 1;
					//Inicia countdown de disponibilidade
					element.IntervaloDisponibilidade = $interval(function() {
						$scope.funcaoCountdown(element, element.DataCountdownDisponibilidade, 0);
					}, 1000);
					//Desliga este intervalo
					$interval.cancel(element.Intervalo);
				} else {
					element.Disponivel = 2;
					//Desliga o intervalo
					$interval.cancel(element.IntervaloDisponibilidade);
				}
			}
		}
		
		//Chama /eventos
		$scope.eventosGetter = function() {
			httpService.get('/eventos', function(answer) {
				if(answer != false) {
					$scope.eventos = answer.eventos;
					$scope.horaServidor = answer.hora;
					
					//Atualiza hora do servidor
					if(!$scope.intervalo) {
						$scope.intervalo = $interval(function() {
							$scope.horaServidor += 1000;
						}, 1000);
					}
					
					//Para cada evento
					$scope.eventos.forEach(function(element) {
						//Seta strings e capa
						switch(element.Tipo) {
							case 1:
								element.TipoString = "Preleção";
								element.Capa = "../rsc/event_images/prelecao-crop.jpg";
							break;
							case 2:
								element.TipoString = "Trekking";
								
								switch(element.TipoTrekking) {
									case "Ping-Pong":
										element.Capa = "../rsc/event_images/ping-pong-crop.jpg";
									break;
									case "Circuito":
										element.Capa = "../rsc/event_images/circuito.jpg";
									break;
									case "Travessia":
										element.Capa = "../rsc/event_images/travessia.jpg";
									break;
								}
							break;
							case 3:
								element.TipoString = "Acampamento";
								element.Capa = "../rsc/event_images/camping-crop.jpg";
							break;
						}
						
						//Seta Countdown
						var data = element.DataInscricao;
						element.DataCountdown = new Date(data).getTime();
						element.Disponivel = 0;
						element.Countdown = "Disponível em 0 dias 0 horas 0 min 0 seg";
						
						//Seta CountdownDisponibilidade
						var dataDisponibilidade = element.FimInscricao;
						element.DataCountdownDisponibilidade = new Date(dataDisponibilidade).getTime();

						//Inicia Countdown
						element.Intervalo = $interval(function() {
							$scope.funcaoCountdown(element, element.DataCountdown, 1);
						}, 1000);
					});
					
					//POST Confirmados
					$scope.eventos.forEach(function(element) {
						$scope.postConfirmado(element);
					});
					
					//POST Confirmados Por Mim
					$scope.confirmadosPorMim();
					
					//Inicializa Materialize stuff
					$(document).ready(function() {
						$('.modal').modal();
						$('.scrollspy').scrollSpy();
	
						
						$('.dropdown-button').dropdown({
							inDuration: 300,
							outDuration: 225,
							constrainWidth: false, // Does not change width of dropdown to that of the activator
							hover: false, // Activate on hover
							gutter: 0, // Spacing from edge
							belowOrigin: true, // Displays dropdown below the button
							alignment: 'right', // Displays dropdown with edge aligned to the left of button
							stopPropagation: false // Stops event propagation
						});
						
						$('.dropdown-button').dropdown();
					});
					
					//Libera caminho para RANKING
					$rootScope.$broadcast('dataEventos', true);
					
					//Manda os dados pro EventosService
					eventosService.set($scope.eventos);
				}
			}.bind(this));
		}
		
		//POST Confirmados em Eventos
		$scope.postConfirmado = function(evento) {
			var data = {
				IDEvento: evento.ID
			}
			
			httpService.post('/confirmados', data, function(answer) {
				evento.Confirmados = answer;
			});
		}
		
		//Confirmar em Evento
		$scope.confirmarEvento = function(evento) {
			$("#btn-confirmar-" + evento.ID).attr("disabled", true);
			
			var data = {
				evento: evento.ID,
				usuario: $rootScope.usuario.ID,
				blacklist: $rootScope.usuario.ListaNegra
			}
			console.log(data.blacklist);
			//Chama POST Confirmar Evento
			httpService.post('/confirmar-evento', data, function(answer) {
				//Reabilita o botao de se inscrever
				$("#btn-confirmar-" + evento.ID).attr("disabled", false);
				
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Inscrição em evento realizada com sucesso!", 3000);
										
					//Atualiza lista de confirmados
					$scope.postConfirmado(evento);
					$scope.confirmadosPorMim();
				} else {
					Materialize.toast("Erro ao se inscrever no evento! Verifique se você está na lista negra.", 3000);
				}
			});
		}
		
		//Cancelar em Evento
		$scope.cancelarEvento = function(evento) {
			$("#btn-cancelar-" + evento.ID).attr("disabled", true);
			
			var data = {
				evento: evento.ID,
				max: evento.NumeroMax,
				usuario: $rootScope.usuario.ID
			}
			
			//Chama POST Confirmar Evento
			httpService.post('/cancelar-evento', data, function(answer) {
				//Reabilita o botao de se inscrever
				$("#btn-cancelar-" + evento.ID).attr("disabled", false);
				
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Cancelamento em evento realizado com sucesso!", 3000);
					
					//Atualiza lista de confirmados
					$scope.postConfirmado(evento);
					$scope.confirmadosPorMim();
				} else {
					Materialize.toast("Erro ao se cancelar no evento!", 3000);
				}
			});
		}
		
		//POST Eventos Confirmados
		$scope.confirmadosPorMim = function() {
			var data = {
				usuarioID: $rootScope.usuario.ID
			}
			
			httpService.post('/confirmados-por-mim', data, function(answer) {
				$rootScope.eventosConfirmados = answer;
				
			});
		}
		
		//Verifica se evento foi confirmado pelo cara
		$scope.estaConfirmado = function(evento) {
			if(!$rootScope.eventosConfirmados || $rootScope.eventosConfirmados.length == 0) {
				return false;
			} else {
				return $rootScope.eventosConfirmados.some(function(element) {
					return element.ID == evento.ID;
				});				
			}
		}
		
		//Finalizar evento
		$scope.finalizarEvento = function(params, eventoID, fatorKAntigo) {
			//Pega as pessoas marcadas
			var pessoas = $("input[name='pessoas[]']").toArray();
			var pessoasArray = [];
			var kilometragemParaFloat =  parseFloat(params.Kilometragem.replace(',','.'));
			var subidaParaFloat = parseFloat(params.subida.replace(',','.'));
			var descidaParaFloat = parseFloat(params.descida.replace(',','.'));
						
			pessoas.forEach(elem => pessoasArray.push(elem.value));
			
			var dataPost = {
				eventoID: eventoID,
				//fatorK na verdade eh a pontucao, math.abs eh o modulo do numero
				fatork: (kilometragemParaFloat * (1+(subidaParaFloat + Math.abs(descidaParaFloat))/1000)),
				fatorKAntigo: fatorKAntigo,
				subdesc: 1+(subidaParaFloat + Math.abs(descidaParaFloat))/1000,
				distancia: kilometragemParaFloat,
				pessoas: pessoasArray
			};
			
			//Chama POST Finalizar Evento
			httpService.post('/finalizar-evento', dataPost, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Evento finalizado com sucesso!", 2000);					
					$scope.eventosGetter();
				} else {
					
				}
			});
		}



		//Finalizar Evento Prelecao - Sem Fator K
		$scope.finalizarEventoPrelecao = function(eventoID) {
			var dataPost = {
				eventoID: eventoID
			}
			
			//Chama POST Excluir Evento
			httpService.post('/finalizar-evento-prelecao', dataPost, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Evento finalizado com sucesso!", 2000);					
					$scope.eventosGetter();
				} else {
					Materialize.toast("Erro ao finalizar evento", 3000);
				}
			});
		}


		//Adicionar usuario na lista negra
		$scope.adicionarListaNegra = function(id, idevento) {
			var dataPost = {
				ID: id,
				IDEvento: idevento
			}

			//Chama POST Adicionar na lista negra
			httpService.post('/adicionar-lista-negra', dataPost, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Usuario adicionado na lista negra com sucesso!", 2000);					
				} else {
					Materialize.toast("Erro ao adicionar usuario na lista negra", 3000);
				}
			});
		}



		//Remover usuario da lista negra
		$scope.removerListaNegra = function(id, idevento) {
			var dataPost = {
				ID: id,
				IDEvento: idevento
			}

			//Chama POST Remover na lista negra
			httpService.post('/remover-lista-negra', dataPost, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Usuario removido da lista negra com sucesso!", 2000);					
				} else {
					Materialize.toast("Erro ao remover usuario da lista negra", 3000);
				}
			});
		}


		
		
		//Excluir Evento
		$scope.excluirEvento = function(eventoID) {
			var data = {
				ID: eventoID
			}
			
			//Chama POST Excluir Evento
			httpService.post('/excluir-evento', data, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Evento excluído com sucesso!", 2000);					
					$scope.eventosGetter();
				} else {
					Materialize.toast("Erro ao excluir o evento!", 3000);
				}
			});
		}

		//Excluir Usuario
		$scope.excluirUsuario = function(id, idevento) {
			var data = {
				ID: id,
				IDEvento: idevento
			}
			
			//Chama POST Excluir Usuario
			httpService.post('/excluir-usuario', data, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Usuário excluído com sucesso!", 2000);					

				} else {
					Materialize.toast("Erro ao excluir o usuario!", 3000);
				}
			});
		}
		
		
		//Inicializa
		$rootScope.$on("InicializarEventos", function() {
			$scope.eventosGetter();
		});
		
		//Recarrega eventos
		$rootScope.$on("RecarregarEventos", function() {
			$scope.eventosGetter();
		});
	}]);


	//CriarPostsController
	app.controller('CriarPostsController', ['HTTPService', 'EventosService', '$timeout', '$scope', '$location', '$rootScope', function(httpService, eventosService, $timeout, $scope, $location, $rootScope) {
		$scope.eventos = eventosService.get();
		
		$timeout(function() {
			$(document).ready(function() {
				//Select
				$('select').material_select();
				

				//Post fixado
				$("#fixado").change(function() {
					if(this.checked) {
						$("#evento-atrelado").attr("disabled", true);
						$("#evento-atrelado").material_select();
					} else {
						$("#evento-atrelado").attr("disabled", false);
						$("#evento-atrelado").material_select();
					}
				});
			});
		});
		
		$scope.criarPostagem = function(params) {
			var data = {
				Texto: params.TextoPostagem.replace(/\n\r?/g, '<br />'), //Insere os break-lines
				EventoID: params.EventoAtrelado || 0,
				Fixado: params.Fixado || false,
				Data: new Date().toString().substring(0, 24), //Pega data em horario local sem lixo
				AdminID: $rootScope.usuario.ID
			};
					
			//POST /criar-postagem
			httpService.post('/criar-postagem', data, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Postagem criada com sucesso!", 2000);
					$location.path('/main-page');
					
					//Recarrega os posts
					$rootScope.$broadcast('RecarregarPosts', true);
				} else {
					Materialize.toast("Erro ao criar a postagem!", 3000);
				}
			});
		}
	}]);
	
	
	//PostsController
	app.controller('PostsController', ['HTTPService', '$timeout', '$scope', '$rootScope', '$location', function(httpService, $timeout, $scope, $rootScope, $location) {
		//GET Postagens
		$scope.postagemGetter = function() {
			httpService.get('/get-postagem', function(answer) {
				if(answer) {
					$scope.postagem = answer.reverse();
					$scope.postagemFixada = answer;
					
					$scope.postsFiltro = [];
					$scope.postsFiltro.push({Nome: "Todos", EventoID: 0, Fixado: 0});
					
					//Pega so um evento
					var filtrado = [];
					var assistente = [].concat($scope.postagem);
					assistente.forEach(function(elem, index, array) {
						if(!filtrado.some(a => a.EventoID == elem.EventoID)) {
							filtrado.push(elem);
						}
					});
					$scope.postsFiltro = $scope.postsFiltro.concat(filtrado);
					
					//Coisas pro filtro
					$timeout(function() {
						if($("#filtro-posts option:first-child").val() == '?') {
							$("#filtro-posts option:first-child").remove();
							$("#filtro-posts option:first-child").attr("selected", true);
						}
						$scope.filtrar();
					}, 200);
					
				} else {
					$scope.postagem = false;
				}
			}.bind(this));
		}
		
		$scope.filtrar = function() {
			var idFiltro = $("#filtro-posts").find(":selected").val().replace("number:", "");
					
			if(idFiltro == 0) {
				$scope.postagem = $scope.postagemFixada;
			} else {
				$scope.postagem = $scope.postagemFixada.filter(post => post.EventoID == idFiltro);
			}
		}
		
		$scope.excluirPostagem = function(id) {
			var data = {
				ID: id
			};
			
			//POST /excluir-postagem
			httpService.post('/excluir-postagem', data, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Postagem excluída com sucesso!", 2000);
					
					//Recarrega os posts
					$rootScope.$broadcast('RecarregarPosts', true);
				} else {
					Materialize.toast("Erro ao excluir a postagem!", 3000);
				}
			});
		}
		
		//Inicializa
		$scope.postagemGetter();
		
		//Quando tem que recarregar
		$rootScope.$on('RecarregarPosts', function(event) {
			$scope.postagemGetter();
		});		
	}]);


	//Ranking Controller
	app.controller('RankingController', ['HTTPService', '$rootScope', function(httpService, $rootScope) {
	
		//Quando EventosController ja acabou
		$rootScope.$on('dataEventos', function(event) {
			//Chama RankingService
			httpService.get('/ranking', function(answer) {
				if(answer != null) {
					$rootScope.ranking = answer;
				}
			}.bind(this));
		});			
	}]);
})();