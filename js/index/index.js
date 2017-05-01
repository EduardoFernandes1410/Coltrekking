var usuarioLogado;
var url;
var xmlhttp = new XMLHttpRequest();

/***********************CARREGAR PAGINA*********************/
window.onload = function(){
	//Monta ranking
	//ranking();
}

/*********************POST INFO DO LOGADO**********************/
function login() {
	url = '/login'; //URL da solicitacao
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
			usuarioLogado = JSON.parse(xmlhttp.responseText);
			//Atualiza a pagina
			mostraInfo();
		}
	};
	xmlhttp.open("POST", url, true);
	xmlhttp.send();
/*
	//ANGULAR
	$http({
		method: 'POST',
		url: '/login'
	}).then(function successCallback(response) {
		usuarioLogado = JSON.parse(response.data);
		mostraInfo();
	}, function errorCallback(response) {
		//erro
		console.log(response.status);
	});
	*/
}

/*******************MOSTRA DADOS DO USUARIO*********************/
function mostraInfo() {
/*
	//Mostra imagem
	document.getElementById('userImage').src = usuarioLogado.Foto;
	document.getElementById('userImage').style.width = "50px";
	document.getElementById('userImage').style.height = "50px";
	//Mostra mensagem de boas vindas
	document.getElementById('welcomeMessage').innerHTML = "Bem Vindo " + usuarioLogado.Nome;
	//Mostra fator k
	document.getElementById('fatork').innerHTML = "Fator K: " + usuarioLogado.FatorK;
	//Mostra posicao
	document.getElementById('posicao').innerHTML = "Posição no Ranking: " + usuarioLogado.Posicao;
	//Mostra estado lista negra
	document.getElementById('listaNegra').innerHTML = "Estado na Lista Negra: " + usuarioLogado.ListaNegra;
*/
}

/**************************RANKING***************************/
function ranking() {
	//Monta o ranking
	url = '/ranking'; //URL da solicitacao
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
			console.log("Ranking bem-sucedido");
			login();
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

/*************************SIGN OUT**************************/
function signOut() {
	firebase.auth().signOut().then(function() {
		//SignOut bem-sucedido
		userInfo = null;
		user = null;
	}, function(error) {
		//Deu ruim
	});
}