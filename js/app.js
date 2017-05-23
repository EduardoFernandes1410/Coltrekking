(function() {
	var app = angular.module('main', ['ngRoute']);

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
	//POST /login
	app.factory('LoginService', function($http) {
		var loginService = {};

		loginService.postUsuario = function(callback) {
			$http.get('/get-user').then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {
				//Erro
				var answer = null;
				callback(answer)
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
		loginService.postUsuario(function(answer) {
			if(answer != null) {
				this.usuarioLogado = answer;
			}
		}.bind(this));
	}]);


	//Route Controller
	app.controller('RouteController', function($scope, $location) {
		$scope.$location = $location.path();
	}.bind(this));


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