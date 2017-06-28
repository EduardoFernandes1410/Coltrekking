var googleProvider = new firebase.auth.GoogleAuthProvider();
var facebookProvider = new firebase.auth.FacebookAuthProvider();

var user;
var url;
var xmlhttp = new XMLHttpRequest();
var usuarioInfo = new Object();

/***Quando a pagina carrega***/
window.onload = function() {
	initApp();
}

/***Google Sign In***/
function googleSignIn() {
	firebase.auth().signInWithRedirect(googleProvider);
	
	//Altera botao de login
	document.getElementById('loginGoogle').disabled = true;
	document.getElementById('loginGoogle').value = "Redirecting...";
}

/***Facebook Sign In***/
function facebookSignIn() {
	facebookProvider.addScope('email');
	firebase.auth().signInWithRedirect(facebookProvider);
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
			xmlhttp.onreadystatechange = function() {
				if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					/*Redireciona para logged.html*/
					window.location = xmlhttp.responseText;
				}
			};
			xmlhttp.open("POST", url, true);
			xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xmlhttp.send(JSON.stringify(usuarioInfo));				
		}
		else {					
			console.log("Nao tem user");
		}					
	});

	/*Pega resultado de redirecionamento*/
	firebase.auth().getRedirectResult().then(function(result) {
		if(result.credential) {
			var token = result.credential.accessToken;
		}
		//Info do usuario logado
		user = result.user;

	}).catch(function(error) {
		//Aqui cuida dos erros
		var errorCode = error.code;
		//Erro de ja ter cadastrado com outro provider
		if(errorCode == 'auth/account-exists-with-different-credential') {
			alert("Ja tem cadastro");
		}

		var errorMessage = error.message;

		//O email do usuario logado
		var email = error.email;
		//Tipo de credencial do FireBase usada
		var credential = error.credential;
	});
}