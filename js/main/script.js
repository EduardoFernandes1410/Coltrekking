/**********Materialize**********/
$(document).ready(function() {
	//SideNav
	$(".button-collapse").sideNav({closeOnClick: true, draggable: false});

	//ScrollSpy
	$('.scrollspy').scrollSpy();
	
});

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