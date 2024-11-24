// Baptiste JOUIN (intercambio, Francia, pasaporte: 23KH84343)
// https://youtu.be/xUz1vyMmtYk

class Principal {
  constructor() {
    this.pantallaActual = 1;
    this.juego = new Juego();
    this.pantallas = {
      inicio: new Pantalla(
        "El Juego del Tesoro",
        "Haz clic para empezar",
        "¡Recoge los tesoros y evita los obstáculos!"
      ),
      instrucciones: new Pantalla(
        "Instrucciones",
        "Usa las flechas del teclado para moverte",
        "← → ↑ ↓ para mover el personaje\nRecoge 50 tesoros para ganar\n¡Cuidado con los obstáculos!"
      ),
      creditos: new Pantalla(
        "¡Fin del Juego!",
        "Haz clic para volver al inicio",
        "codigo @baptistejouin\nAssets by https://pixel-boy.itch.io/"
      ),
    };
  }

  dibujar() {
    background(0);

    switch (this.pantallaActual) {
      case 1:
        this.pantallas.inicio.dibujar();
        break;
      case 2:
        this.pantallas.instrucciones.dibujar();
        break;
      case 3:
        this.juego.dibujar();
        break;
      case 4:
        this.pantallas.creditos.dibujar();
        break;
    }

    if (this.juego.haTerminado()) {
      this.juego = new Juego();
      this.pantallaActual = 4;
    }
  }

  mousePressed() {
    if (this.pantallaActual === 4) {
      this.pantallaActual = 1;
    } else if (this.pantallaActual !== 3) {
      this.pantallaActual = this.pantallaActual + 1;
    }
  }

  teclaPresionada() {
    if (this.pantallaActual === 3) {
      this.juego.teclaPresionada();
    }
  }
}

class Pantalla {
  constructor(titulo, subtitulo, descripcion) {
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.descripcion = descripcion;
  }

  dibujar() {
    textAlign(CENTER, CENTER);

    textSize(48);
    fill("#FFD700");
    text(this.titulo, width / 2, height / 3);

    textSize(24);
    fill("#FFFFFF");
    text(this.subtitulo, width / 2, height / 2);

    textSize(18);
    fill("#A9A9A9");
    text(this.descripcion, width / 2, (height * 2) / 3);
  }
}

class Jugador {
  constructor() {
    this.tamano = 32;
    this.posX = width / 2;
    this.posY = height - 50;
    this.vidas = 3;
    this.velocidad = 5;
    this.invencible = false;
    this.tiempoInvencible = 0;
    this.personajeActual = 0;
    this.personajes = [
      imagenes[2].get(0, 0, 16, 16),
      imagenes[2].get(16, 0, 16, 16),
      imagenes[2].get(32, 0, 16, 16),
      imagenes[2].get(48, 0, 16, 16),
    ];
  }

  mover(direccion) {
    if (direccion === "derecha") {
      this.posX = this.posX + this.velocidad;
      this.personajeActual = 3;
    } else if (direccion === "izquierda") {
      this.posX = this.posX - this.velocidad;
      this.personajeActual = 2;
    } else if (direccion === "arriba") {
      this.personajeActual = 1;
      this.posY = this.posY - this.velocidad;
    } else if (direccion === "abajo") {
      this.personajeActual = 0;
      this.posY = this.posY + this.velocidad;
    }

    this.posX = constrain(this.posX, this.tamano / 2, width - this.tamano / 2);
    this.posY = constrain(this.posY, this.tamano / 2, height - this.tamano / 2);
  }

  dibujar() {
    push();
    translate(this.posX, this.posY);

    if (this.invencible) {
      if (frameCount % 10 < 5) {
        tint(255, 0, 0);
      } else {
        tint(255, 255, 255);
      }
    }

    imageMode(CENTER);
    image(
      this.personajes[this.personajeActual],
      0,
      0,
      this.tamano,
      this.tamano
    );
    pop();

    if (this.invencible) {
      if (millis() - this.tiempoInvencible > 2000) {
        this.invencible = false;
      }
    }
  }

  recibirDano() {
    if (!this.invencible) {
      sonidos[1].play();
      this.vidas = this.vidas - 1;
      this.invencible = true;
      this.tiempoInvencible = millis();
      this.posX = width / 2;
      this.posY = height - 50;
    }
  }

  teclaPresionada() {
    if (keyCode === RIGHT_ARROW) {
      this.mover("derecha");
    } else if (keyCode === LEFT_ARROW) {
      this.mover("izquierda");
    } else if (keyCode === UP_ARROW) {
      this.mover("arriba");
    } else if (keyCode === DOWN_ARROW) {
      this.mover("abajo");
    }
  }
}

class Tesoro {
  constructor(juego) {
    this.tamano = 32;
    this.juego = juego;
    this.reposicionar();
    this.tesoroActual = 0;
    this.tesoros = [
      imagenes[0].get(0, 0, 10, 10),
      imagenes[0].get(10, 0, 10, 10),
      imagenes[0].get(20, 0, 10, 10),
      imagenes[0].get(30, 0, 10, 10),
    ];
  }

  reposicionar() {
    let posicion = this.juego.encontrarPosicionValida(this.tamano);
    this.posX = posicion.posX;
    this.posY = posicion.posY;
  }

  dibujar() {
    push();
    translate(this.posX, this.posY);
    imageMode(CENTER);
    image(this.tesoros[this.tesoroActual], 0, 0, this.tamano, this.tamano);
    pop();
  }

  actualizar() {
    this.tesoroActual = floor(frameCount / 10) % this.tesoros.length;
  }
}

class Obstaculo {
  constructor(tipo = "estatico") {
    this.tamano = 32;
    this.tipo = tipo;
    this.reposicionar();
    this.velocidad = random(2, 4);
    this.direccion = random(TWO_PI);
  }

  reposicionar() {
    this.posX = random(this.tamano, width - this.tamano);
    this.posY = random(this.tamano, height - this.tamano);
  }

  actualizar() {
    if (this.tipo === "movil") {
      this.posX = this.posX + cos(this.direccion) * this.velocidad;
      this.posY = this.posY + sin(this.direccion) * this.velocidad;

      if (this.posX < this.tamano || this.posX > width - this.tamano) {
        this.direccion = PI - this.direccion;
      }
      if (this.posY < this.tamano || this.posY > height - this.tamano) {
        this.direccion = -this.direccion;
      }
    }
  }

  dibujar() {
    push();
    translate(this.posX, this.posY);
    imageMode(CENTER);
    if (this.tipo === "estatico") {
      image(imagenes[4], 0, 0, this.tamano, this.tamano);
    } else {
      image(imagenes[1], 0, 0, this.tamano, this.tamano);
    }
    pop();
  }
}

class Juego {
  constructor() {
    this.jugador = new Jugador();
    this.tesorosRecogidos = 0;
    this.nivel = 1;
    this.obstaculos = [];
    this.tesoros = [];
    this.decor = null;
    this.generarNivel(); // genera los obstaculos y tesoros
    this.generarMapa(); // genera el mapa de fondo una sola vez
    sonidos[3].setVolume(0.1);
  }

  dibujar() {
    image(this.decor, 0, 0);

    for (let i = 0; i < this.tesoros.length; i++) {
      this.tesoros[i].actualizar();
      this.tesoros[i].dibujar();
    }

    for (let j = 0; j < this.obstaculos.length; j++) {
      this.obstaculos[j].actualizar();
      this.obstaculos[j].dibujar();
    }

    this.jugador.dibujar();
    this.verificarColisiones();
    this.mostrarEstadisticas();
    this.playMusic();
  }

  mostrarEstadisticas() {
    textAlign(LEFT, TOP);
    textSize(16);
    fill(255);
    text("Vidas: " + this.jugador.vidas, 10, 10);
    text("Tesoros: " + this.tesorosRecogidos, 10, 30);
    text("Nivel: " + this.nivel, 10, 50);
    textAlign(RIGHT, TOP);
    textSize(20);
    fill(255);
    text("Puntos: " + this.tesorosRecogidos + "/50", width - 20, 20);
  }

  playMusic() {
    if (!sonidos[3].isPlaying()) {
      sonidos[3].play();
    }
  }

  encontrarPosicionValida(tamano) {
    let posX = random(tamano, width - tamano);
    let posY = random(tamano, height - tamano);

    for (let i = 0; i < this.obstaculos.length; i++) {
      let obstaculo = this.obstaculos[i];
      if (
        dist(posX, posY, obstaculo.posX, obstaculo.posY) <
        (tamano + obstaculo.tamano) / 2
      ) {
        return this.encontrarPosicionValida(tamano);
      }
    }

    return { posX, posY };
  }

  generarMapa() {
    let numDetalles = 80;
    let detallesTamano = 32;
    let posDetalles = [
      imagenes[3].get(0, 32, 16, 16),
      imagenes[3].get(80, 0, 16, 16),
      imagenes[3].get(96, 0, 16, 16),
      imagenes[3].get(16, 32, 16, 16),
      imagenes[3].get(32, 32, 16, 16),
      imagenes[3].get(48, 32, 16, 16),
      imagenes[3].get(64, 32, 16, 16),
      imagenes[3].get(80, 32, 16, 16),
      imagenes[3].get(96, 32, 16, 16),
      imagenes[3].get(112, 32, 16, 16),
    ];

    let buffer = createGraphics(width, height); // crea un buffer para optimizar el rendimiento
    buffer.noSmooth();
    buffer.noStroke();

    buffer.background("#74A334");

    for (let i = 0; i < numDetalles; i++) {
      buffer.image(
        random(posDetalles),
        random(width),
        random(height),
        detallesTamano,
        detallesTamano
      );
    }

    this.decor = buffer;
  }

  generarNivel() {
    this.obstaculos = [];
    this.tesoros = [];

    let numObstaculos = 5 + this.nivel * 2;
    for (let i = 0; i < numObstaculos; i++) {
      let tipo = i % 2 === 0 ? "movil" : "estatico"; // alternar entre movil y estatico
      this.obstaculos.push(new Obstaculo(tipo));
    }

    let numTesoros = 3;
    for (let j = 0; j < numTesoros; j++) {
      this.tesoros.push(new Tesoro(this));
    }
  }

  verificarColisiones() {
    for (let i = 0; i < this.tesoros.length; i++) {
      let tesoro = this.tesoros[i];
      if (
        dist(this.jugador.posX, this.jugador.posY, tesoro.posX, tesoro.posY) <
        (this.jugador.tamano + tesoro.tamano) / 2
      ) {
        tesoro.reposicionar();
        sonidos[0].play();
        this.tesorosRecogidos = this.tesorosRecogidos + 1;

        if (this.tesorosRecogidos % 10 === 0) {
          this.nivel = this.nivel + 1;
          this.generarNivel();
        }
      }
    }

    for (let j = 0; j < this.obstaculos.length; j++) {
      let obstaculo = this.obstaculos[j];
      if (
        dist(
          this.jugador.posX,
          this.jugador.posY,
          obstaculo.posX,
          obstaculo.posY
        ) <
        (this.jugador.tamano + obstaculo.tamano) / 2
      ) {
        this.jugador.recibirDano();
      }
    }
  }

  haTerminado() {
    if (this.tesorosRecogidos >= 50 || this.jugador.vidas <= 0) {
      sonidos[3].stop();
      sonidos[2].play();
      return true;
    }
    return false;
  }

  teclaPresionada() {
    this.jugador.teclaPresionada();
  }
}

let principal, imagenes, sonidos;

function preload() {
  imagenes = [
    loadImage("./assets/img/tesoro.png"),
    loadImage("./assets/img/monkey.png"),
    loadImage("./assets/img/boy.png"),
    loadImage("./assets/img/floor-details.png"),
    loadImage("./assets/img/hole.png"),
  ];

  soundFormats("wav");
  sonidos = [
    loadSound("./assets/sound/coin.wav"),
    loadSound("./assets/sound/hit.wav"),
    loadSound("./assets/sound/game-over.wav"),
  ];
  soundFormats("ogg");
  sonidos.push(loadSound("./assets/sound/game.ogg"));
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvasParent");
  noSmooth();
  principal = new Principal();
}

function draw() {
  principal.dibujar();

  if (keyIsPressed) {
    principal.teclaPresionada();
  }
}

function mousePressed() {
  principal.mousePressed();
}

// prevent scrolling with arrow keys
window.addEventListener(
  "keydown",
  function (e) {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code
      ) > -1
    ) {
      e.preventDefault();
    }
  },
  false
);
