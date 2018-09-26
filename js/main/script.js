/**********Materialize**********/
$(document).ready(function() {
	//SideNav
	$(".button-collapse").sideNav({closeOnClick: true, draggable: false});

	//ScrollSpy
	$('.scrollspy').scrollSpy();

	//Select options (usado no ranking)
	$('select').material_select();

	// Depois que carregar, setar mais 3 segundos, para garantir o carregamento
	setTimeout(function(){ 
		document.getElementById("loading").remove();
		document.body.style.backgroundColor = "#FAFAFA";
		document.getElementById("conteudo").style.display = "block";

		//Setar Se esta na lista negra ou nao
		if(document.getElementsByClassName("listaNegraSimOuNao")[0].innerHTML == 0){
			document.getElementsByClassName("listaNegraSimOuNao")[0].innerHTML = "Não";
			document.getElementsByClassName("listaNegraSimOuNao")[1].innerHTML = "Não";
		}
		else{
			document.getElementsByClassName("listaNegraSimOuNao")[0].innerHTML = "Sim";
			document.getElementsByClassName("listaNegraSimOuNao")[1].innerHTML = "Sim";
		}


		//Verifica se não ha pessoas na lista negra para mostrar a mensagem "nao ha pessoas na lista negra"
		if(!document.getElementsByClassName("listaNegraUsuario")[0]){
			document.getElementById("naoHapessoasListaNegra").style.display="block";
			document.getElementById("nomeUsuariosListaNegra").style.display="none";
		}


		//Script que remove o filtro do ano que nao estamos
		for (j=0;j<5;j++) {
			var list = document.getElementsByClassName("dropdown-content select-dropdown")[0];
			var ano = new Date().getFullYear();
			for (i=1;i<list.getElementsByTagName("LI").length;i++){
				if (list.getElementsByTagName("LI")[i].innerText > ano) {
					list.getElementsByTagName("LI")[i].remove();                		
				}
			}
		}

	}, 3000);	
});

//Mostrar o botao de mostrar os eventos dos outros anos apenas na guia eventos finalizados
function botaoMostrarEventosAnteriores() {
	$('.botaoEventosAnteriores').css("display", "block");
}
function NAOmostrarBotaoEventosAnteriores() {
	$('.botaoEventosAnteriores').css("display", "none");
}


//script para mostrar alguma tab e ocultar as outras
function mostrarRanking() {
	$('#esconderEventosFinalizadosAoClicarEmOutraTab').css("display", "none");
	$('#listaNegraOcultaNosEventosFinalizados').css("display", "none");
	$('#rankingOcultoNosEventosFinalizados').css("display", "block");
}
function mostrarListaNegra() {
	$('#esconderEventosFinalizadosAoClicarEmOutraTab').css("display", "none");
	$('#listaNegraOcultaNosEventosFinalizados').css("display", "block");
	$('#rankingOcultoNosEventosFinalizados').css("display", "none");
}
function mostrarEventos() {
	$('#esconderEventosFinalizadosAoClicarEmOutraTab').css("display", "block");
	$('#listaNegraOcultaNosEventosFinalizados').css("display", "none");
	$('#rankingOcultoNosEventosFinalizados').css("display", "none");
}


// Script para remover a mensagem para escolher algum ano do ranking
function esconderMensagemEscolhaAno(){
	$("#escolhaUmAnoRanking").remove();
}

/**********FORMULARIO**********/
//Verifica o tipo do evento inserido
function verificaTipo() {

	/*
	var x = document.getElementById("tipo").value;
	document.getElementById("demo").innerHTML = "You selected: " + x;

	var y = document.getElementById("tipoTrekking").value;
	document.getElementById("demo2").innerHTML = "You selected: " + y;

	var z = document.getElementById("dificuldade").value;
	document.getElementById("demo3").innerHTML = "You selected: " + z;
	*/

	//Apos clicar, nao deixar escolher novamente pois ira bugar
	$("#tipo").attr("disabled", true);
	$("#tipo").material_select();

	//Se for prelecao
	if($("#tipo").find(":selected").val() == 1) {
		//Mostrar o campo para inserir a data da prelecao
		$("#dataPrelecao").css("display", "block");
	}
	
	//Se for trekking
	if($("#tipo").find(":selected").val() == 2) {
		//mostrar os campos dificuldade e tipo do trekking
		$("#DificuldadeETipodoTrekking").css("display", "block");
		//Mostrar o campo para inserir a data do trekking
		$("#dataTrekking").css("display", "block");
	}
	
	//Se for acampa
	if($("#tipo").find(":selected").val() == 3) {
		//Sumir dificuldade e colocar a dificuldade que ocupa todo o espaco
		$("#dificuldadeAcamp").css("display", "block");
		//Mostrar o campo para inserir a data do acampamento
		$("#dataAcampamento").css("display", "block");
	}
	else {
		$("#dataFim").attr("disabled", true);
	}
}

/**********LOG OUT**********/
function logOut() {
	firebase.auth().signOut().then(function() {
		//SignOut bem-sucedido
	}, function(error) {
		//Deu ruim
	});
}