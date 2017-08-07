(function() {
	var app = angular.module('main', ['ngRoute']);

//**********Middleware**********//
	app.run(['$rootScope', '$location', 'LoginService', function($rootScope, $location, Login) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			var admin;
			
			//Pega permissao de admin de usuario logado
			Login.getUsuario(function(usuario) {
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
				}
				//Se nao for admin
				else {
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
				templateUrl: "../html/create/news.html"
			}
		)
		.otherwise(
			{
				//redirectTo: "/"
			}
		);
	});

//**********Servicos**********//
	//GET /login
	app.factory('LoginService', function($http) {
		var loginService = {};
		var usuario;

		loginService.getUsuario = function(callback) {
			$http.get('/get-user').then(function successCallback(response) {
				//Sucesso
				usuario = response.data;
				callback(usuario);
			}, function errorCallback(response) {
				//Erro
				usuario = null;
				callback(usuario);
			});
		}

		return loginService;
	});

	//Criar e editar eventos
	app.factory('CriarEventoService', function($http) {
		var criarEventoService = {};

		//POST /criar-evento
		criarEventoService.postCriarEvento = function(data, callback) {
			$http.post('/criar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}
		
		//POST /editar-evento
		criarEventoService.postEditarEvento = function(data, callback) {
			$http.post('/editar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}

		return criarEventoService;
	});


	//Tudo relacionado a eventos
	app.factory('EventosService', function($http) {
		var eventosService = {};

		//GET /eventos
		eventosService.getEventos = function(callback) {
			$http.get('/eventos').then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(callback) {
				//Erro
				var answer = null;
				callback(answer);
			});
		}
		
		//POST /confirmar-evento
		eventosService.confirmarEvento = function(data, callback) {
			$http.post('/confirmar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}
		
		//POST /cancelar-evento
		eventosService.cancelarEvento = function(data, callback) {
			$http.post('/cancelar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}

		//POST /confirmados
		eventosService.getConfirmados = function(data, callback) {
			var post = {IDEvento: data};
			
			$http.post('/confirmados', post).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(callback) {
				//Erro
				var answer = null;
				callback(answer);
			});
		}
		
		//POST /confirmados-por-mim
		eventosService.getConfirmadosPorMim = function(data, callback) {
			var post = {usuarioID: data};
			
			$http.post('/confirmados-por-mim', post).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(callback) {
				//Erro
				var answer = null;
				callback(answer);
			});
		}
		
		//POST /finalizar-evento
		eventosService.finalizarEvento = function(data, callback) {			
			$http.post('/finalizar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}
		
		//POST /excluir-evento
		eventosService.excluirEvento = function(data, callback) {
			var post = {ID: data};
			
			$http.post('/excluir-evento', post).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}

		return eventosService;
	});


	//GET /ranking
	app.factory('RankingService', function($http) {
		var rankingService = {};

		rankingService.getRanking = function(callback) {
			$http.get('/ranking').then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(callback) {
				//Erro
				var answer = null;
				callback(answer);
			});
		}

		return rankingService;
	});

//**********Controles**********//
	//Login Controller
	app.controller('LoginController', ['LoginService', '$rootScope', function(loginService, $rootScope) {
		var usuarioLogado;

		//Chama LoginService
		loginService.getUsuario(function(answer) {
			if(answer != null) {
				this.usuarioLogado = answer;
				//Salva no rootScope para uso posterior
				$rootScope.usuario = answer;
			}
		}.bind(this));
	}]);


	//Route Controller
	app.controller('RouteController', function($scope, $location) {
		$scope.$location = $location;
	});


	//CriarEventos Controller
	app.controller('CriarEventoController', ['CriarEventoService', '$timeout', '$scope', '$location', '$compile', function(criarEventoService, $timeout, $scope, $location, $compile) {
		//Modo Edicao
		$scope.modoEdicao = !jQuery.isEmptyObject($location.search());
		
		//Parametros enviados por GET
		if($scope.modoEdicao) {
			$scope.eventoAttr = $location.search();
			$scope.eventoAttr.numeroMax = parseInt($scope.eventoAttr.numeroMax);
			$scope.eventoAttr.dataInscricao += " GMT";
			
			//Arruma a data de inscricao
			var data = new Date($scope.eventoAttr.dataInscricao);
			$scope.eventoAttr.dataHora = (data.getHours() >= 10 ? data.getHours() : "0" + data.getHours()) + ":" + (data.getMinutes() >= 10 ? data.getMinutes() : "0" + data.getMinutes());
			$scope.eventoAttr.dataDia = data.getDate() >= 10 ? data.getDate() : "0" + data.getDate();
			$scope.eventoAttr.dataDia += "/" + (data.getMonth() >= 10 ? data.getMonth() : "0" + data.getMonth());
			$scope.eventoAttr.dataDia += "/" + data.getFullYear();
			
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
			
			//Deleta params.HorarioInscricao
			delete params.HorarioInscricao;
			
			//Retorna os parametros arrumados
			return params;
		}

		//Submit o formulario de CRIAR EVENTO
		$scope.criarEvento = function(params) {
			//Arruma os parametros
			params = arrumaParametros(params);
			
			//Chama o POST Criar Evento
			criarEventoService.postCriarEvento(params, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Evento criado com sucesso!", 3000);
					$location.path('/');
				} else {
					Materialize.toast("Erro ao criar o evento!", 3000);
				}
			});
		}
		
		//Submit o formulario de CRIAR EVENTO
		$scope.editarEvento = function(params) {
			console.log("PARAMETROS");
			console.log(params);
			//Arruma os parametros
			params = arrumaParametros(params);			
			//Pega o ID do evento
			params.ID = $location.search().id;
						
			//Chama o POST Criar Evento
			criarEventoService.postEditarEvento(params, function(answer) {
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Evento editado com sucesso!", 3000);
					$location.path('/main-page');
				} else {
					Materialize.toast("Erro ao editar o evento!", 3000);
				}
			});
		}
	}]);


	//Eventos Controller
	app.controller('EventosController', ['EventosService', '$timeout', '$rootScope', '$scope', '$interval',  function(eventosService, $timeout, $rootScope, $scope, $interval) {
		var eventos;

		//Chama EventosService
		eventosService.getEventos(function(answer) {
			if(answer != false) {
				this.eventos = answer;
				
				//Para cada evento
				this.eventos.forEach(function(element) {
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
					var dataCountdown = new Date(data).getTime();
					element.Disponivel = 0;
					element.Countdown = "Disponível em 0 dias 0 horas 0 min 0 seg";
										
					//Inicia Countdown
					element.Intervalo = $interval(function() {
						var agora = new Date(new Date().toUTCString().replace(" GMT", "")).getTime();
						var distancia = dataCountdown - agora;
						
						//Transforma distancia em d h m s
						var days = Math.floor(distancia / (1000 * 60 * 60 * 24));
						var hours = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
						var minutes = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
						var seconds = Math.floor((distancia % (1000 * 60)) / 1000);
						
						//Transforma distancia em string
						element.Countdown = "Disponível em " + days + " dias " + hours + " horas " + minutes + " min " + seconds + " seg ";
						
						//Confere se acabou o tempo
						if(distancia <= 0) {
							element.Disponivel = 1;
							$interval.cancel(element.Intervalo);
						}
					}, 1000);
				});				
				
				//POST Confirmados
				this.eventos.forEach(function(element) {
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
			}
		}.bind(this));
		
		//POST Confirmados em Eventos
		$scope.postConfirmado = function(evento) {
			eventosService.getConfirmados(evento.ID, function(answer) {
				evento.Confirmados = answer;
			});
		}
		
		//Confirmar em Evento
		$scope.confirmarEvento = function(evento) {
			$("#btn-confirmar").attr("disabled", true);
			
			var data = {
				evento: evento.ID,
				usuario: $rootScope.usuario.ID
			}
			
			//Chama POST Confirmar Evento
			eventosService.confirmarEvento(data, function(answer) {
				//Reabilita o botao de se inscrever
				$("#btn-confirmar").attr("disabled", false);
				
				//Emite alerta sobre o status da operacao e redireciona
				if(answer) {
					Materialize.toast("Inscrição em evento realizada com sucesso!", 3000);
										
					//Atualiza lista de confirmados
					$scope.postConfirmado(evento);
					$scope.confirmadosPorMim();
				} else {
					Materialize.toast("Erro ao se inscrever no evento!", 3000);
				}
			});
		}
		
		//Cancelar em Evento
		$scope.cancelarEvento = function(evento) {
			var data = {
				evento: evento.ID,
				max: evento.NumeroMax,
				usuario: $rootScope.usuario.ID
			}
			
			//Chama POST Confirmar Evento
			eventosService.cancelarEvento(data, function(answer) {
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
			var usuarioID = $rootScope.usuario.ID;
			
			eventosService.getConfirmadosPorMim(usuarioID, function(answer) {
				$rootScope.eventosConfirmados = answer;
				
				//Seta margin top do scroll spy em funcao da altura do card (Pessima solucao)
				setTimeout(function() {
					var altura = $('#card-confirmados').height() + 36;
					
					$('.table-of-contents').css("margin-top", altura + "px");
				}, 100);
			});
		}
		
		//Verifica se evento foi confirmado pelo cara
		$scope.estaConfirmado = function(evento) {
			if(!$rootScope.eventosConfirmados) {
				return false;
			} else {
				return $rootScope.eventosConfirmados.some(function(element) {
					return element.ID == evento.ID;
				});				
			}
		}
		
		//Finalizar evento
		$scope.finalizarEvento = function(params, eventoID) {
			//Pega as pessoas marcadas
			var pessoas = $("input[name='pessoas[]']:checked").toArray();
			var pessoasArray = [];
						
			pessoas.forEach(elem => pessoasArray.push(elem.value));
			
			var dataPost = {
				eventoID: eventoID,
				fatork: (params.Fatork * params.Kilometragem),
				pessoas: pessoasArray
			};
			
			//Chama POST Finalizar Evento
			eventosService.finalizarEvento(dataPost, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Evento finalizado com sucesso!", 3000);
				} else {
					Materialize.toast("Erro ao finalizar o evento!", 3000);
				}
			});
		}
		
		//Excluir Evento
		$scope.excluirEvento = function(eventoID) {
			//Chama POST Excluir Evento
			eventosService.excluirEvento(eventoID, function(answer) {
				//Emite alerta sobre o status da operacao
				if(answer) {
					Materialize.toast("Evento excluído com sucesso!", 3000);
				} else {
					Materialize.toast("Erro ao excluir o evento!", 3000);
				}
			});
		}
	}]);


	//Ranking Controller
	app.controller('RankingController', ['RankingService', '$rootScope', function(rankingService, $rootScope) {
		var ranking;

		//Quando EventosController ja acabou
		$rootScope.$on('dataEventos', function(event) {
			//Chama RankingService
			rankingService.getRanking(function(answer) {
				if(answer != null) {
					$rootScope.ranking = answer;
				}
			}.bind(this));			
		});		
	}]);
})();