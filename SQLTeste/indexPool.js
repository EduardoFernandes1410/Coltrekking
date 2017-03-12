//Declara os requerimentos
var express	= require("express");
var mysql	= require('mysql');
var app		= express();

//Declara POOL
var pool	= mysql.createPool({
	connectionLimit : 300, //limite de conexoes
	host			: 'localhost',
	user			: 'root',
	password		: 'eduardo007',
	database		: 'teste',
	debug			: false
});

//Faz as coisas
function handle_database(req, res) {
	pool.getConnection(function(err, connection) {
		//Se deu erro
		if(err){
			res.json({"code": 100, "status": "Error in connection database"});
			return;
		}
		//Printa ID do connectado
		console.log("Connected as id " + connection.threadId);

		//Query
		connection.query('SELECT * FROM testetable2', function(err, rows) {
			connection.release();
			//Funciona
			if(!err){
				res.json(rows);
			}
		});

		connection.on('error', function(err) {
			res.json({"code": 100, "status": "Error in connection database"});
			return;
		})
	});
}

//Requisicao
app.get("/", function(req, res) {
	handle_database(req, res);
});

app.listen(3000);