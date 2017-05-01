(function() {
	var app = angular.module('main', ['ngRoute']);

//**********Servicos**********//
	//POST /login
	app.factory('MainService', function($http) {
		var mainService = {};

		mainService.postUsuario = function(callback) {
			$http.post('/login').then(function successCallback(response) {
				//Sucesso
				var answer = response.data;
				callback(answer);
			}, function errorCallback(response) {
				//Erro
				var answer = null;
				callback(answer)
			});
		}

		return mainService;
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
	//Main Controller
	app.controller('MainController', ['MainService', function(mainService) {
		//Chama MainService
		mainService.postUsuario(function(answer) {
			if(answer != null) {
				this.usuarioLogado = answer;
			}
		}.bind(this));
	}]);

	//Ranking Controller
	app.controller('RankingController', ['RankingService', function(rankingService) {
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