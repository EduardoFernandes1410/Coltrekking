/**********Materialize**********/
$(document).ready(function() {
	//SideNav
	$(".button-collapse").sideNav({closeOnClick: true, draggable: false});
	
	//ScrollSpy
	$('.scrollspy').scrollSpy();
});


/**********FORMULARIO**********/
//Redimensiona a Textarea
function resize() {
	//Calculate number of lines
	var numberOfLines = $("#local").val().split(/\r\n|\r|\n/).length;
	//Get lineheight from CSS
	var lineHeight = $("#local").css('line-height');
	//Convert from px-string to number
	lineHeight = lineHeight.replace("px", "");
	//Calculate height for textarea
	var textAreaHeight = numberOfLines*lineHeight;
	//Convert from number to px-string
	var stylingTextAreaHeight = "".concat(textAreaHeight).concat("px");

	//Set textarea height to calculated height
	$("#local").css("height",stylingTextAreaHeight);
}

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
}

/**********LOG OUT**********/
function logOut() {
	firebase.auth().signOut().then(function() {
		//SignOut bem-sucedido
	}, function(error) {
		//Deu ruim
	});
}