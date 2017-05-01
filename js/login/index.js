var userLogado;
var url;
var xmlhttp = new XMLHttpRequest();

/***Pega info do user logado***/
window.onload = function(){
	//Monta ranking
	ranking();
}

//Pega info do usuario logado
function login() {
	url = '/login'; //URL da solicitacao
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
			userLogado = JSON.parse(xmlhttp.responseText);
			console.log(userLogado);
			//Atualiza a pagina
			mostraInfo();
		}
	};
	xmlhttp.open("POST", url, true);
	xmlhttp.send();
}

/***Mostra dados do usuario***/
function mostraInfo() {
	console.log(userLogado);
	//Mostra imagem
	document.getElementById('userImage').src = userLogado.Foto;
	document.getElementById('userImage').style.width = "50px";
	document.getElementById('userImage').style.height = "50px";
	//Mostra mensagem de boas vindas
	document.getElementById('welcomeMessage').innerHTML = "Bem Vindo " + userLogado.Nome;
	//Mostra fator k
	document.getElementById('fatork').innerHTML = "Fator K: " + userLogado.FatorK;
	//Mostra posicao
	document.getElementById('posicao').innerHTML = "Posição no Ranking: " + userLogado.Posicao;
	//Mostra estado lista negra
	document.getElementById('listaNegra').innerHTML = "Estado na Lista Negra: " + userLogado.ListaNegra;
}

/***Ranking***/
function ranking() {
	console.log("VOU MONTAR RANKING");
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

/***Sign Out***/
function signOut() {
	firebase.auth().signOut().then(function() {
		//SignOut bem-sucedido
		userInfo = null;
		user = null;
		console.log("Volte sempre!");
	}, function(error) {
		//Deu ruim
	});
}