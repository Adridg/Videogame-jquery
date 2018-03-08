  $(document).ready(function(){
  	$('#capa').css({"left":"110px", "top":"140px"});
  	setTimeout(function() 
  	{
  		$('#capa').animate({
  			top: "+=20"
  		}, 1 );
  	}, 1000);

  	var topeVida=4; // vida máxima del jugador
  	var puntosTotales=0; // puntos totales que tiene el jugador (es el que se muestra en la interfaz)
  	var puntosEnemigo=25; // puntos por matar enemigos
  	var llaveCaida=false; // boolean que controla que ha salido la llave
  	var llave=false; //boolean que controla que la llave se ha depositado en la puerta
  	var cuentaDisparo=0; //controla el tiempo de disparo
  	var cuentaAtaque=0; //controla el tiempo de ataque cuerpo a cuerpo
  	var teclaPulsada=""; //controla la tecla que ha sido pulsada
  	var movimiento = false; //controla que se ha reproducido un gif del héroe al andar en una dirección determinada
  	var imagen= $('#capa').children("img"); //coger la imagen que está en el div del héroe
  	var puntoVida=4; //vida que tiene el jugador 
  	var temporizadorArco =false; //activa el temporizadorArco
  	var temporizadorEspada =false; //activa el temporizadorEspada
  	var valorArco=100; //valor por defecto de la progressbar del arco
  	var valorEspada=100; //valor por defecto de la progressbar de la espada
  	var golpe=""; //determina con que arma se ha realizado el ataque (espada/arco)
  	var damageEspada=1; //daño normal de la espada
  	var damageArco=1; //daño normal del arco
  	var pasarNivel=false; // boolean que controla que se pueda pasar de nivel
  	var nivel =1; //nivel inicial
  	var cantidadEnemigo=2; //cantidad inicial de enemigos
  	var velocidadEnemigo = 6000; //velocidad de movimiento inicial de los enemigos
  	var velocidadDisparoEnemigo = 4500; //velocidad de disparo inicial de los enemigos
  	var inmortalidad = false; //boolean que controla un breve periodo de inmortalidad del héroe tras recibir daño


	 var snd = new Audio("recursos/musica/musica2.mp3");
	 snd.play();
	 snd.loop = true;
	 
    //para hacer funcionar el draggable y droppable
    $( "#draggable" ).draggable();
    $( "#droppable" ).droppable({
    	drop: function( event, ui ) {
    		$("#draggable").css("display","none");
    		$('#puertaSalida').attr("src","recursos/puertaAbierta.png");
    		var sonido = new Audio("recursos/musica/abrirPuerta.mp3");
    		sonido.play();
    		llave =true;
    	}
    });
    setTimeout(function(){ $('#puertaSalida').attr("src","recursos/puertaCerrada.png") }, 1000);

    //las barras de los potenciadores en la interfaz
    $('#barraEspada').css( {"position": "absolute", "top":"10px", "left":"40px", "width":"70%", "height": "10px"});
    $('#barraArco').css(  {"position": "absolute", "top":"30px", "left":"40px", "width":"70%", "height": "10px"});
    $('#barraEspada').progressbar( );
    $('#barraArco').progressbar();
    $('#barraEspada').progressbar( "disable");
    $('#barraArco').progressbar("disable");

  //configuración del dialogo
  $("#dialog").dialog({
  	height: 140,
  	modal: false,
  });



  //sistema de colisión entre dos elementos
  function collision(jqDiv1, jqDiv2) {  
  	$(jqDiv2).each(function() {
  		var x1 = jqDiv1.offset().left;
  		var y1 = jqDiv1.offset().top;
  		var h1 = jqDiv1.outerHeight(true);
  		var w1 = jqDiv1.outerWidth(true);
  		var b1 = y1 + h1;
  		var r1 = x1 + w1;
  		var x2 = $(this).offset().left;
  		var y2 = $(this).offset().top;
  		var h2 = $(this).outerHeight(true);
  		var w2 = $(this).outerWidth(true);
  		var b2 = y2 + h2;
  		var r2 = x2 + w2;

        if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2)  //detectar colisiones
        	var bColision= false;
        else
        {
        	var bColision = true;
        	if (jqDiv1.hasClass('jugador') && $(this).hasClass('fisicaObj'))
        		choque(jqDiv1, $(this));
        	else if (jqDiv1.hasClass('jugador') && $(this).hasClass('fisicaEnemigo'))
        	{
        		choqueObstaculo(jqDiv1);
        		quitarVidaJugador();
        		inmortalidad = true;
        		setTimeout(function(){  inmortalidad=false }, 3000);
        	}
        	else if (jqDiv1.hasClass('jugador') && $(this).hasClass('obstaculo'))
        	{
        		choqueObstaculo(jqDiv1);
        	}
        	else if (jqDiv1.hasClass('fisicaEnemigo') && $(this).hasClass('obstaculo'))
        	{
        		jqDiv1.stop(false,false);
        		jqDiv1.animate({left: "+=15px"},5);
        	}
        	else if (jqDiv1.hasClass('jugador') &&  $(this).hasClass('pocion'))
        	{

        		var recuperacion= $('.iconoVidaVacio').first()
        		recuperacion.attr("src", "recursos/vida.png");
        		recuperacion.addClass('iconoVida');
        		recuperacion.removeClass('iconoVidaVacio');

        		if (puntoVida < 4)
        		{
        			puntoVida = puntoVida+1;
        		}
        		$(this).remove();
        	}
        	else if (jqDiv1.hasClass('jugador') &&  $(this).hasClass('powerArco'))
        	{
        		$(this).remove();
        		$('#barraArco').progressbar( "enable" );
         	damageArco=2; //daño arco aumentado
         	activarPotenciador("arco");
         }
         else if (jqDiv1.hasClass('jugador') &&  $(this).hasClass('powerEspada'))
         {
         	$(this).remove();
         	$('#barraEspada').progressbar( "enable" );
         	damageEspada=2; //daño arco aumentado
         	activarPotenciador("espada");
         }
         else if($(this).hasClass('puerta') && pasarNivel == true && llave == true)
         {
         	jqDiv1.fadeOut("slow");
         	puntosTotales = puntosTotales + 150;
         	$('#puntos').remove();
         	$('#puntuacion').append('<span id="puntos">Puntos: '+puntosTotales+'</span>');
         	$('#puntos').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"20px"})
         	nivel = nivel + 1;
         	snd.pause();
         	prepararNivel(nivel);
         }
     }
 });
  }

    //método que activa el potenciador del arco o espada
    function activarPotenciador (arma)
    {
    	if (arma== "arco")
    	{
    		valorArco=100;
    		$('#barraArco').progressbar({value: valorArco});
    		temporizadorArco=true;
    	}
    	else
    	{
    		valorEspada=100;
    		$('#barraEspada').progressbar({value: valorEspada});
    		temporizadorEspada=true;
    	}
    }

// intervalo de tiemppo que dura el potenciador
setInterval(function(){
	if (temporizadorArco == true)
	{
		valorArco = valorArco-1
		$('#barraArco').progressbar({value: valorArco});
	}
	if (temporizadorEspada == true)
	{
		valorEspada = valorEspada-1;
		$('#barraEspada').progressbar({value: valorEspada});
	}

	if (valorEspada == 0)
	{
		$('#barraEspada').progressbar( "disable" );
		valorEspada = 100;
		temporizadorEspada=false;
		damageEspada=1; //daño normal de la espada
	}
	if (valorArco == 0)
	{
		$('#barraArco').progressbar( "disable" );
		valorArco = 100;
		temporizadorArco = false;
		damageArco=1; //daño normal del arco
	}

}, 100)

// método que prepara el siguiente nivel del juego
function prepararNivel(nivel)
{
	snd = new Audio("recursos/musica/musica2.mp3");
	snd.play();
	snd.loop = false;
	$('#level').remove();
	$('#nivel').append('<span id="level">Nivel: '+nivel+'</span>');
	$('#level').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"20px"})
	llaveCaida=false;
	llave=false;
	cuentaDisparo=0;
	cuentaAtaque=0;
	teclaPulsada="";
	movimiento = false;
	imagen= $('#capa').children("img");
	temporizadorArco =false;
	temporizadorEspada =false;
	valorArco=100;
	valorEspada=100;
	golpe="";
  	damageEspada=1; //daño normal de la espada
  	damageArco=1; //daño normal del arco
  	pasarNivel=false;
  	temporizador = 200;
  	cantidadEnemigo=cantidadEnemigo+1;
  	velocidadEnemigo= velocidadEnemigo/3
  	velocidadDisparoEnemigo = velocidadDisparoEnemigo*0.95;
  	setTimeout(function(){ $('#puertaSalida').attr("src","recursos/puertaCerrada.png") }, 1000);
  	generarEnemigos(cantidadEnemigo);
  	movimientoEnemigo(velocidadEnemigo);
  	$('.pocion').remove();
  	$('.powerArco').remove();
  	$('.powerEspada').remove();
  	$('#capa').fadeIn("slow");

  	$('#capa').css({"left":"110px", "top":"140px"});

  	setTimeout(function() 
  	{
  		$('#capa').animate({
  			top: "+=20"
  		}, 1 );
  	}, 1000);
  	setTimeout(function(){$('.heroe').first().attr("src", "Heroe/quietoAbajo.png");}, 400);
  	$('#barraEspada').progressbar( "disable");
  	$('#barraArco').progressbar("disable");
  	$('#barraArco').progressbar({value: 0});
  	$('#barraEspada').progressbar({value: 0});
  }


function choque(jugador, pared) //colision del jugador contra las paredes principales del juego
{
	jugador.stop(true,true); 
	var idDiv= pared.attr("id");
	if (teclaPulsada=="arriba" && idDiv =="pared3" )                                                 
		jugador.animate({top: "+=15px"},5);          
	else if (teclaPulsada=="abajo" && idDiv =="pared4" )
		jugador.animate({top: "+=-15px"},5); 
	else if (teclaPulsada=="izquierda" && idDiv =="pared2" )
		jugador.animate({left: "+=15px"},5); 
	else if (teclaPulsada=="derecha" && idDiv =="pared" )
		jugador.animate({left: "+=-15px"},5);
}

function choqueObstaculo(jqDiv1)   //colisiónes contra los obstaculos del juego
{  
	jqDiv1.stop(true,true); 
	if (teclaPulsada=="arriba")                                              
		jqDiv1.animate({top: "+=10px"},5);          
	else if (teclaPulsada=="abajo"  )
		jqDiv1.animate({top: "+=-10px"},5); 
	else if (teclaPulsada=="izquierda" )
		jqDiv1.animate({left: "+=10px"},5); 
	else if (teclaPulsada=="derecha"  )
		jqDiv1.animate({left: "+=-10px"},5);
}

function collisionArma(jqDiv1, jqDiv2) {   //sistrma de colisiones para las armas del jugador y del enemigo con otro elemento del juego
	$(jqDiv2).each(function() {

		var x1 = jqDiv1.offset().left;
		var y1 = jqDiv1.offset().top;
		var h1 = jqDiv1.outerHeight(true);
		var w1 = jqDiv1.outerWidth(true);
		var b1 = y1 + h1;
		var r1 = x1 + w1;
		var x2 = $(this).offset().left;
		var y2 = $(this).offset().top;
		var h2 = $(this).outerHeight(true);
		var w2 = $(this).outerWidth(true);
		var b2 = y2 + h2;
		var r2 = x2 + w2;

        if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2)  //detectar colisiones
        {
        	var bColision= false;
        }
        else
        {
        	var bColision = true;
        	jqDiv1.remove();
        	if ($(this).hasClass("enemigo"))
        	{
        		if (golpe=="arco")
        		{
        			var vida=  $(this).data("vida") - damageArco;
        		}
        		else
        		{
        			var vida=  $(this).data("vida") - damageEspada;
        		}

        		$(this).append('<div id=dialog>');
        		$(this).find('#dialog').empty();

        		if (vida <= 0){
        			var coordenadas = $(this).position();
              // sumar puntos
              puntosTotales= puntosTotales+puntosEnemigo;
              $('#puntos').remove();
              $('#puntuacion').append('<span id="puntos">Puntos: '+puntosTotales+'</span>');
              $('#puntos').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"20px"})

              //probabilidad de dropear pociones 
              var looteo= parseInt(Math.round(Math.random() * (3 - 1) + 1));
              if (looteo==2)
              {  
              	var poti= $("<div class='pocion'></div>");
              	poti.append('<img src="recursos/pocion.gif"/>');
              	poti.css({"top": coordenadas.top, "left": coordenadas.left})
              	$('#creadorAleatorio').append(poti);

              }

              $(this).remove();
              if (llaveCaida == false && $( ".enemigo" ).length == 0)
              {
              	$("#draggable").css("display","block");
              	$("#draggable").css({"top": coordenadas.top, "left": coordenadas.left})
              	llaveCaida = true;
              	pasarNivel = true;
              	var sonido = new Audio("recursos/musica/item.mp3");
              	sonido.play();
              }
          }
          else
          {
          	$(this).data("vida", vida);
          	$(this).find('#dialog').append(vida);
          	setTimeout(function(){
          		$('#dialog').each(function() 
          		{
          			$(this).remove()
          		});
          	},1000)
          	var dimensionBarra=110-(100/vida)
          	$(this).find(".barraEnemigo").progressbar({value: dimensionBarra});
          }

      }
      else if ($(this).hasClass("jugador"))
      {
      	quitarVidaJugador();
      	inmortalidad = true;
      	setTimeout(function(){  inmortalidad=false }, 1000);
      }
  }
});

}
// método que le quita una vida al jugador
function quitarVidaJugador()
{
	if (inmortalidad == false)
	{
    	    //efecto de daño
    	    $(".heroe").effect( "pulsate", 1000, callback );
    	    function callback() {
    	    	setTimeout(function() {
    	    		$( "#effect" ).removeAttr( "style" ).hide().fadeIn();
    	    	}, 1000 );
    	    };
    	    /*****************/
    	    puntoVida = puntoVida-1;
    	    $("#capa").append('<div id=dialog>');
    	    $("#capa").find('#dialog').empty();

    	    var corazon= $('.iconoVida').last()
    	    corazon.attr("src", "recursos/vidaVacia.png");
    	    corazon.addClass('iconoVidaVacio');
    	    corazon.removeClass('iconoVida');

    	    if (puntoVida == 0)
    	    {
    	    	gameOver();
    	    }
    	    else
    	    {
    	    	$("#capa").data("vida", puntoVida);
    	    	$("#capa").find('#dialog').append("<span>Daño recibido</span>");
    	    	setTimeout(function(){$('#dialog').each(function() {$(this).remove()});},1000)
    	    }
    	}
    }

 //tiempo de partida
 var temporizador = 200;
 setInterval(function(){
 	$('#temporizador').remove();
 	$('#tiempo').append('<span id="temporizador">'+temporizador+'</span>');
 	$('#temporizador').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"80px"})
 	temporizador--;
 	if (temporizador == 10)
 	{
 		snd.pause();
 		snd = new Audio("recursos/musica/tiempo.mp3");
 		snd.play();

 	}

        //derrota por pérdida de tiempo
        if (temporizador == -2)
        {
        	gameOver();
        }
    },1000);


   //sistema de gameOver para cuando acabe el tiempo o quiten todas la vida del jugador
   function gameOver()
   {
   	snd.pause();
   	snd = new Audio("recursos/gameOver.mp3");
   	snd.play();
   	snd.loop = false;
   	$("body").empty();
   	$("body").append("<h1 id='fin'>GAME OVER</h1>");
   	$("body").append("<h2 id='punt'> Puntuación = "+puntosTotales+"</h2>");
   	$("body").append('<button id="repetir" type="button">Volver a jugar</button>');
   	$("#fin").css({"margin-left":"40%","margin-top":"10%", "color":"red"});
   	$("#punt").css({"margin-left":"40%","margin-top":"12%"});
   	$("#repetir").css({"margin-left":"40%","margin-top":"14%"});
   	$("#repetir").click(function(){location.href ="juego.html";});
   }


setInterval(function(){cuentaDisparo=0},3000); //intervalo entre disparo
setInterval(function(){cuentaAtaque=0},800);  //intervalo entre ataque cuerpo a cuerpo

//método  para el movimiento del personaje
$(document).keydown(function(tecla)
{
	teclaPulsada =comprobarMovimiento(tecla);
});

//método para el ataque del jugador
$(document).keyup(function(tecla)
{
	if (tecla.keyCode == 97) //ataque cuerpo a cuerpo
	{
		if (cuentaAtaque == 0)
		{
			$('#capa').prepend('<div>');
			var zonaEspada= $('#capa').children('div').first();
			zonaEspada.addClass('espada');
			var snd = new Audio("recursos/espada.mp3");

			if (teclaPulsada == "derecha")
			{
				$('#capa').children('img').attr("src","Heroe/atqDrch.gif");
				zonaEspada.css({"top": '10px', "left":"40px" });
				snd.play();
				setTimeout(function(){
					$('#capa').children('img').attr("src","Heroe/quietoDrch.png");
					zonaEspada.remove();
				},800);
			}
			else if (teclaPulsada == "izquierda") 
			{
				zonaEspada.css({"top": '10px', "left":"-40px" });
				$('#capa').children('img').attr("src","Heroe/atqIzq.gif");
				snd.play();
				setTimeout(function(){
					$('#capa').children('img').attr("src","Heroe/quietoIzq.png");
					zonaEspada.remove();
				},800);
			}
			else if (teclaPulsada == "abajo") 
			{

				$('#capa').children('img').attr("src","Heroe/atqAbajo.gif");
				zonaEspada.css({"top": '50px', "left":"0px", "width": "100%", "height": "50%"});
				snd.play();
				setTimeout(function(){
					$('#capa').children('img').attr("src","Heroe/quietoAbajo.png");
					zonaEspada.remove();
				},800);
			}
			else
			{

				$('#capa').children('img').attr("src","Heroe/atqArriba.gif");
				zonaEspada.css({"top": '-30px', "left":"0px", "width": "100%", "height": "50%"});
				snd.play();
				setTimeout(function(){
					$('#capa').children('img').attr("src","Heroe/quietoArriba.png");
					zonaEspada.remove();
				},800);
			}
			golpe="espada";
			var colision= collisionArma(zonaEspada, $('.enemigo'));
			cuentaAtaque++;
		}

	}
  else if (tecla.keyCode == 98) //controla las animaciones de la flecha según  la posición en la que apunte
  {

  	if (cuentaDisparo == 0)
  	{

  		if (teclaPulsada == "derecha")
  			$('#capa').children('img').attr("src","Heroe/disparoDrch.gif");
  		else if (teclaPulsada == "izquierda") 
  			$('#capa').children('img').attr("src","Heroe/disparoIzq.gif");
  		else if (teclaPulsada == "abajo") 
  			$('#capa').children('img').attr("src","Heroe/disparoAbajo.gif");
  		else
  			$('#capa').children('img').attr("src","Heroe/disparoArriba.gif");

  		setTimeout(function(){ 

  			var x1 = $('#capa').position();
  			var ejey= x1.top;
  			var ejex= x1.left;

  			$('#mapa').append('<div>');
  			var flecha= $('#mapa').children('div').last();
  			flecha.addClass('flecha');

  			if (teclaPulsada == "derecha")
  			{
  				flecha.css({"top": (ejey-50)+"px", "left": (ejex+40)+"px"});
  				flecha.css("background-image", "url('recursos/flechaDerecha.png')");
  				flecha.animate({
  					left: "+=2000px"
  				}, 4000 );


  				$('#capa').children("img")[0].src="Heroe/quietoDrch.png";
  			}
  			else if (teclaPulsada == "izquierda") 
  			{
  				flecha.css({"top": (ejey-50)+"px", "left": (ejex-40)+"px"});
  				flecha.css("background-image", "url('recursos/flechaIzquierda.png')");
  				flecha.animate({
  					left: "-=2000px"
  				}, 4000 );
  				$('#capa').children("img")[0].src="Heroe/quietoIzq.png";
  			}
  			else if (teclaPulsada == "abajo") 
  			{
  				flecha.css({"top": (ejey-10)+"px", "left": (ejex-5)+"px", "width": "60%", "height": "40px"});
  				flecha.css("background-image", "url('recursos/flechaAbajo.png')");
  				flecha.animate({
  					top: "+=2000px"
  				}, 4000 );
  				$('#capa').children("img")[0].src="Heroe/quietoAbajo.png";
  			}
  			else
  			{
  				flecha.css({"top": (ejey-120)+"px", "left": (ejex-5)+"px", "width": "60%", "height": "40px"});
  				flecha.css("background-image", "url('recursos/flechaArriba.png')");
  				flecha.animate({
  					top: "-=2000px"
  				}, 4000 );
  				$('#capa').children("img")[0].src="Heroe/quietoArriba.png";
  			}
  			golpe="arco";

  			var snd = new Audio("recursos/flecha.mp3");
  			snd.play();

  		}, 900);

  		cuentaDisparo++;
  	}
  }
});

        $(document).keyup(function(tecla) //para poner la imagen estática cuando se deja de pulsar una letra
        {
           if (tecla.keyCode == 40 || tecla.keyCode == 83  ) { //si suelta la flecha de abajo o la s
           	$('#capa').children("img")[0].src="Heroe/quietoAbajo.png";
           	movimiento =false;


            }else if(tecla.keyCode == 38 || tecla.keyCode == 87  ) { //si suelta la flecha de arriba o la w
            	$('#capa').children("img")[0].src="Heroe/quietoArriba.png";
            	movimiento =false;

            }else if(tecla.keyCode == 37 || tecla.keyCode == 65 ){ //si suelta la flecha de la izquierda o la a
            	$('#capa').children("img")[0].src="Heroe/quietoIzq.png";
            	movimiento =false;

            }
            else if(tecla.keyCode == 39 || tecla.keyCode == 68  ) // si suelta la flecha de la derecha o la d
            {
            	$('#capa').children("img")[0].src="Heroe/quietoDrch.png";
            	movimiento =false;

            }

        });

  function comprobarMovimiento(tecla) //para cambiar la animacion a un gif dependiento de la tecla pulsada y hacerlo andar
  {
              if (tecla.keyCode == 40 || tecla.keyCode == 83 ) { //si pulsas la flecha de abajo o la s
              	$('#capa').animate({top: "+=5px"},10);

              	teclaPulsada ="abajo";

              	if (movimiento == false)
              	{
              		movimiento=true;
              		imagen[0].src="Heroe/andarAbajo.gif"; 

              	}

            }else if(tecla.keyCode == 38 || tecla.keyCode == 87 ) { //si pulsas la flecha de arriba o la w
            	$('#capa').animate({top: "-=5px"},10);
            	teclaPulsada ="arriba";

            	if (movimiento == false)
            	{
            		movimiento=true;
            		imagen[0].src="Heroe/andarArriba.gif";
            	}

            }else if(tecla.keyCode == 37 || tecla.keyCode == 65 ){ //si pulsas la flecha de la izquierda o la a
            	$('#capa').animate({left: "+=-5px"},10);
            	teclaPulsada ="izquierda";

            	if (movimiento == false)
            	{
            		movimiento=true;
            		imagen[0].src="Heroe/andarIzq.gif";
            	}

            }
            else if(tecla.keyCode == 39 || tecla.keyCode == 68 ){ // si pulsas la flecha de la derecha o la d

            	$('#capa').animate({left: "+=5px"},10);

            	teclaPulsada ="derecha";
            	if (movimiento == false)
            	{
            		movimiento=true;
            		imagen[0].src="Heroe/andarDrch.gif";
            	}

            }
            return teclaPulsada;
        }


          setInterval(detectarColision,10); //intervalo que comprueba las colisiones
          function detectarColision() //métodos que tiene todas las colisiones del juego
          {
          	var paredes= $('.fisicaObj');
          	var obstaculos= $('.obstaculo');
          	var enemigos= $('.fisicaEnemigo');
          	var flechas= $('.flecha');
          	var disparosEnemigo= $('.disparoEnemigo');
          	var pociones= $('.pocion');
          	var powerArco =  $('.powerArco');
          	var powerEspada =  $('.powerEspada');

          	collision($('#capa'),paredes);
          	collision($('#capa'), obstaculos);
          	collision($('#capa'), enemigos);
          	collision($('#capa'), $('#droppable'));


          	enemigos.each(function(){collision($(this), obstaculos);});

          	enemigos.each(function(){
          		collision($(this), paredes);
          	});

        	$(flechas).each(function()  //controlador de colisiones de las flechas del jugador
        	{
        		collisionArma($(this), $(' #pared'));
        		collisionArma($(this), $(' #pared2'));
        		collisionArma($(this), $(' #pared3'));
        		collisionArma($(this), $(' #pared4'));
        		collisionArma($(this), $('.enemigo'));
        		collisionArma($(this), $('.fisicaEnemigo'));
        		collisionArma($(this), $('.obstaculo'));
        	});

          $(disparosEnemigo).each(function()  // controlador de colisiones de los disparos del enemigo
          {
          	collisionArma($(this), $('#capa'));
          	collisionArma($(this), $(' #pared'));
          	collisionArma($(this), $(' #pared2'));
          	collisionArma($(this), $(' #pared3'));
          	collisionArma($(this), $(' #pared4'));
          	collisionArma($(this), $('.fisicaObj'));
          	collisionArma($(this), $('.obstaculo'));
          });

          
          pociones.each(function(){			// controlador de colisiones con las pociones
          	collision($('#capa'),$(this));
          })

          powerArco.each(function(){			// controlador de colisiones con los powerUpArcos
          	collision($('#capa'),$(this));
          })

          powerEspada.each(function(){			// controlador de colisiones con los powerUpEspadas
          	collision($('#capa'),$(this));
          })
      }

        setInterval(movimientoEnemigo,100); // intervalo de tiempo que se mueve el enemigo

        //método para darle movimiento aleatorio a los enemigos
        function movimientoEnemigo()
        {
        	$('.enemigo').each(function() 
        	{

        		$(this).animate({
        			top:  Math.floor(Math.random()*(400-150+1)+150)
        		},velocidadEnemigo);

        		$(this).animate({
        			left: Math.floor(Math.random()*(1000-250+1)+250)
        		},velocidadEnemigo);

        	});

        }

        setInterval(tiempoDisparoEnemigo,3000);//tiempo de disparo enemigo
        // método que hace que los enemigos disparen
        function tiempoDisparoEnemigo()
        {
        	$('.enemigo').each(function() 
        	{
        		disparoEnemigo($(this));
        	});
        }
        function disparoEnemigo(enemigo)
        {
        	var coordJugador= $('#capa').position();
        	var coordEnemigo= enemigo.position();
        	var capaDisparo = $('<div class="disparoEnemigo"></div>')

        	$('#mapa').prepend(capaDisparo);
        	var disparo= $('#mapa').children('.disparoEnemigo').first();
        	disparo.css({"top": coordEnemigo.top-40, "left": coordEnemigo.left});

        	var potenciaDisparoX=0;
             if (coordJugador.left > coordEnemigo.left) //si supera la coordenada del enemigo
             	potenciaDisparoX = coordJugador.left*3;
             else
             	potenciaDisparoX = coordJugador.left*-3;

             if (coordJugador.top > coordEnemigo.top) //si supera la coordenada del enemigo
             	potenciaDisparoY = coordJugador.top*3;
             else
             	potenciaDisparoY = coordJugador.top*-3;

             if (coordJugador.left > coordEnemigo.left+200 || coordJugador.left < coordEnemigo.left-200 )  
             {
             	disparo.animate({
             		'left': potenciaDisparoX+"px",
             		'top':  coordJugador.top+"px",
             	},velocidadDisparoEnemigo);
             }
             else
             {
             	disparo.animate({
             		'left': coordJugador.left+"px",
             		'top':  potenciaDisparoY+"px",
             	},velocidadDisparoEnemigo);
             }
             setTimeout(function(){disparo.remove()}, 5000);
            disparo.css( { transition: "transform 5.0s", transform:  "rotate(360deg)" } );  //rotar el disparo enemigo
        }


        generarEnemigos(cantidadEnemigo);
        //método que genera enemigos en posiciones aleatoria 
        function generarEnemigos(cantidadEnemigo)
        {
        	for (var i = 0; i < cantidadEnemigo; i++) 
        	{
        		var posX= parseInt(Math.random() * (1000 - 300) + 300);
        		var posY= parseInt(Math.random() * (400 - 170) + 170);
        		var enemigo= $('<div data-vida="3"><img src="Enemigo/IzqQuieto.png"/></div>');
        		enemigo.addClass("enemigo").css({"left": posX, "top": posY});
        		enemigo.addClass( "fisicaEnemigo");
        		var barraVida= enemigo.append('<div class="barraEnemigo">');
        		$('#creadorAleatorio').append(enemigo);
        		$('.barraEnemigo').last().progressbar({value: 100});
        		$('.barraEnemigo').last().css( {"position": "relative", "top": "-80px", "left": "10px", "height": "10px" });

        	} 
        }


        //método que genera potenciadores de forma aleatoria
   generarPotenciador();
   setInterval(generarPotenciador,20000);
   function generarPotenciador()
   {
   	var probabilidad= parseInt(Math.round(Math.random() * (3 - 1) + 1));
   	var posX= parseInt(Math.random() * (1100 - 105) + 105);
   	var posY= parseInt(Math.random() * (400 - 120) + 120);
   	if (probabilidad==1)
   	{ 
   		var potenciarArco= $("<div class='powerArco'></div>");
   		potenciarArco.append('<img src="recursos/powerupArco.gif"/>');
   		potenciarArco.css({"top": posY, "left": posX})
   		$('#creadorAleatorio').append(potenciarArco);
   	}
   	else if (probabilidad==2)
   	{
   		var potenciarEspada= $("<div class='powerEspada'></div>");
   		potenciarEspada.append('<img src="recursos/powerupEspada.gif"/>');
   		potenciarEspada.css({"top": posY, "left": posX})
   		$('#creadorAleatorio').append(potenciarEspada);
   	}
   }



   //generar vida jugador al iniciar partida
   for (var i = 0; i < topeVida; i++) 
   {
   	var vida= $('#vida').append('<img class="iconoVida" src="recursos/vida.png"></img>');

   }
   $('iconoVida').each(function(){
   	$(this).css({"width" : "5%", "height": "5%"}); 
   });


   //puntuación  al iniciar partida
   var puntuacion= 0;
   $('#puntuacion').append('<span id="puntos">Puntos: '+puntuacion+'</span>');
   $('#puntos').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"20px"})


   //nivel al iniciar partida
   $('#nivel').append('<span id="level">Nivel: '+nivel+'</span>');
   $('#level').css({'color' : "white", "font-weight": "bold", "font-size": "x-large", "position": "relative", "top":"-40px", "left":"20px"})

});