<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body>
    <style>
        h1{
            font-size: 50px;
        }
        a{
            font-size: 50px;
        }
    </style>

    <h1>O site do coltrekking mudou para</h1>
    <a href="http://coltrekking.coltec.ufmg.br">coltrekking.coltec.ufmg.br</a>
    <h1 id="tempo">Você será redirecionado em 5 segundos</h1>
    <script>
        setTimeout(function(){
            document.getElementById("tempo").innerHTML="Você será redirecionado em 4 segundos";
        }, 1000);
        setTimeout(function(){
            document.getElementById("tempo").innerHTML="Você será redirecionado em 3 segundos";
        }, 2000);
        setTimeout(function(){
            document.getElementById("tempo").innerHTML="Você será redirecionado em 2 segundos";
        }, 3000);
        setTimeout(function(){
            document.getElementById("tempo").innerHTML="Você será redirecionado em 1 segundos";
        }, 4000);
        setTimeout(function(){
            window.location.href = "http://coltrekking.coltec.ufmg.br";
        }, 5000);
    </script>
</body>
</html>
