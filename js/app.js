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


	//POST /criar-evento
	app.factory('CriarEventoService', function($http) {
		var criarEventoService = {};

		criarEventoService.postCriarEvento = function(data, callback) {
			$http.post('/criar-evento', data).then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {

			});
		}

		return criarEventoService;
	});


	//GET /eventos
	app.factory('EventosService', function($http) {
		var eventosService = {};

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
	app.controller('LoginController', ['LoginService', function(loginService) {
		var usuarioLogado;

		//Chama LoginService
		loginService.getUsuario(function(answer) {
			if(answer != null) {
				this.usuarioLogado = answer;
			}
		}.bind(this));
	}]);


	//Route Controller
	app.controller('RouteController', function($scope, $location) {
		$scope.$location = $location;
	});


	//CriarEventos Controller
	app.controller('CriarEventoController', ['CriarEventoService', '$timeout', '$scope', '$location', function(criarEventoService, $timeout, $scope, $location) {
		//Inicializa elementos do Materialize
		$timeout(function() {
			//Select
			$(document).ready(function() {
				$('select').material_select();
			});

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
		});

		//Submit o formulario
		$scope.criarEvento = function(params) {
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
	}]);


	//Eventos Controller
	app.controller('EventosController', ['EventosService', '$timeout', function(eventosService, $timeout) {
		var eventos;

		//Chama EventosService
		eventosService.getEventos(function(answer) {
			if(answer != false) {
				this.eventos = answer;

				//Adiciona propriedades aos elementos recem-criados
				$timeout(function() {
					//$(".card-evento:odd").addClass("offset-l2");
				});
			}
		}.bind(this));
	}]);


	//Ranking Controller
	app.controller('RankingController', ['RankingService', function(rankingService) {
		var ranking;

		//Chama RankingService
		rankingService.getRanking(function(answer) {
			if(answer != null) {
				this.ranking = answer;
			}
		}.bind(this));
	}]);


	/*
	var usuarios = [ 
		{
			Nome: "Eduardo Fernandes",
			FatorK: 24,
			Foto: "https://lh5.googleusercontent.com/-xlrnfmDLIX0/AAAAAAAAAAI/AAAAAAAACK4/Olb5-F2BglA/photo.jpg",
			Posicao: 1,
			ListaNegra: 0,
			Admin: 0
		},
		{
			Nome: "Pedro Militao",
			FatorK: 12,
			Foto: "https://lh5.googleusercontent.com/-xlrnfmDLIX0/AAAAAAAAAAI/AAAAAAAACK4/Olb5-F2BglA/photo.jpg",
			Posicao: 2,
			ListaNegra: 0,
			Admin: 0
		},
		{
			Nome: "João Lucio",
			FatorK: 8,
			Foto: "https://lh5.googleusercontent.com/-xlrnfmDLIX0/AAAAAAAAAAI/AAAAAAAACK4/Olb5-F2BglA/photo.jpg",
			Posicao: 3,
			ListaNegra: 0,
			Admin: 0
		}
	];*/
})();