var googleProvider = new firebase.auth.GoogleAuthProvider();
var facebookProvider = new firebase.auth.FacebookAuthProvider();

var user;
var url;
var usuarioInfo = new Object();

/***Quando a pagina carrega***/
window.onload = function() {
	initApp();
}

/***Google Sign In***/
function googleSignIn() {
	//Altera botao de login
	$('#loginFacebook, #loginFacebookMobile').attr('disabled', true);
	$('#loginGoogle, #loginGoogleMobile').attr('onClick', 'return false');
	$('#loginGoogle, #loginGoogleMobile').html('<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>');
	
	// firebase.auth().signInWithRedirect(googleProvider);
	signIn(googleProvider);
}

/***Facebook Sign In***/
function facebookSignIn() {
	//Altera botao de login
	$('#loginGoogle, #loginGoogleMobile').attr('disabled', true);
	$('#loginFacebook, #loginFacebookMobile').attr('onClick', 'return false');
	$('#loginFacebook, #loginFacebookMobile').html('<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>');
	
	facebookProvider.addScope('email');
	signIn(facebookProvider);
}

/**Sign In com Popup***/
function signIn(provedor) {
	firebase.auth().signInWithPopup(provedor).then(result => {
		if(result.credential) {
			var token = result.credential.accessToken;
		}
		//Info do usuario logado
		user = result.user;
	}).catch(function(error) {
		//Reativa os botoes
		$('.botao-login').attr('disabled', false);
		$('#loginGoogle').html('<i class="material-icons left"><img src="../../rsc/login/icones/google.png"></i>Entrar com o Google');
		$('#loginFacebook').html('<i class="material-icons left"><img src="../../rsc/login/icones/facebook-box.png"></i>Entrar com o Facebook');
		$('#loginGoogleMobile').html('Entrar c/ Google');
		$('#loginFacebookMobile').html('Entrar c/ Facebook');
		
		var errorCode = error.code;
		//Erro de ja ter cadastrado com outro provider
		if(errorCode == 'auth/account-exists-with-different-credential') {
			alert("O email usado na sua conta já foi cadastrado no site. Tente entrar com a outra rede social.");
		}

		// Informacoes do erro
		var errorMessage = error.message;
		var email = error.email;
		var credential = error.credential;
	});
}

/***Inicializar App***/
function initApp() {
	/*Ao mudar de estado (logado/deslogado)*/
	firebase.auth().onAuthStateChanged(function(user) {
		/*Se logou*/
		if(user) {
			//Seta info do usuario logado
			usuarioInfo.Nome = user.displayName;
			usuarioInfo.Email = user.email;
			usuarioInfo.Foto = user.photoURL;
			usuarioInfo.ID = user.uid;

			/*Manda usuarioInfo para server*/
			url = "/post-user";			
			$.ajax({
				type: "POST",
				url: url,
				data: usuarioInfo,
				success: function(answer) {
					window.location = answer;
				},
				error: function(answer, status) {
					alert("Erro ao realizar o login! Tente novamente");
				}
			});
		}
		else {					
			console.log("Nao tem user");
		}					
	});

	/*Pega resultado de redirecionamento*/
	// firebase.auth().getRedirectResult().then(function(result) {
	// 	if(result.credential) {
	// 		var token = result.credential.accessToken;
	// 	}
	// 	//Info do usuario logado
	// 	user = result.user;
	// }).catch(function(error) {
	// 	//Aqui cuida dos erros
	// 	var errorCode = error.code;
	// 	//Erro de ja ter cadastrado com outro provider
	// 	if(errorCode == 'auth/account-exists-with-different-credential') {
	// 		alert("O email usado na sua conta já foi cadastrado no site. Tente entrar com a outra rede social.");
	// 	}

	// 	var errorMessage = error.message;

	// 	//O email do usuario logado
	// 	var email = error.email;
	// 	//Tipo de credencial do FireBase usada
	// 	var credential = error.credential;
	// });
}