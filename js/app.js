(function() {
	var app = angular.module('main', ['ngRoute']);

	//*****Servicos*****//
	//POST /login
	app.factory('MainService', function($http) {
		return {
			async: function() {
				return $http.post('/login');
			}
		};
	});

	//*****Controle Principal*****//
	app.controller('MainController', ['MainService', function(MainService) {
		//Pega info do usuario
		MainService.async().then(function successCallback(response) {
			//Sucesso
			this.usuarioLogado = response.data;
			//console.log(this.usuarioLogado.Nome);
		}, function errorCallback(response) {
			//Erro
			console.log(response.status);
		});
	}]);

	/*
	var usuario = {
		Nome: "Eduardo Fernandes",
		FatorK: 24,
		Foto: "https://lh5.googleusercontent.com/-xlrnfmDLIX0/AAAAAAAAAAI/AAAAAAAACK4/Olb5-F2BglA/photo.jpg",
		Posicao: 1,
		ListaNegra: 0,
		Admin: 0
	}*/
})();