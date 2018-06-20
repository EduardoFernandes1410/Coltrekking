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
	//Se for prelecao, nao permitir inserir dificuldade
	if($("#tipo").find(":selected").val() == 1) {
		$("#dificuldade").attr("disabled", true);
		$("#dificuldade").material_select();
	}
	else {
		$("#dificuldade").attr("disabled", false);
		$("#dificuldade").material_select();
	}
	
	//Se for trekking, permitir inserir tipo do trekking
	if($("#tipo").find(":selected").val() == 2) {
		$("#tipoTrekking").attr("disabled", false);
		$("#tipoTrekking").material_select();
	}
	else {
		$("#tipoTrekking").attr("disabled", true);
		$("#tipoTrekking").material_select();
	}
	
	//Se for acampa, permitir inserir data fim
	if($("#tipo").find(":selected").val() == 3) {
		$("#dataFim").attr("disabled", false);
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