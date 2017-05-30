(function() {
	var app = angular.module('main', ['ngRoute']);

//**********Middleware**********//
	app.run(['$rootScope', '$location', 'LoginService', function($rootScope, $location, Login) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			var admin;
			console.log(next.templateUrl);
			
			//Pega permissao de admin de usuario logado
			Login.getUsuario(function(usuario) {
				this.admin = usuario.Admin;

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
				templateUrl: "../html/create/event.html"
				//controller: "EventosController",
				//controllerAs: "eventos"
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