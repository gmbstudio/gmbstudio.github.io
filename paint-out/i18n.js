// Idioma: inglés por defecto; español si se elige en la portada (se guarda en el aparato).
// tx(es): textos fijos, buscados por su original en español. tr(es, en): textos con datos dentro.
(function (root) {
  let saved = null; try { saved = localStorage.getItem('po-lang'); } catch {}
  const LANG = saved === 'es' ? 'es' : 'en';
  document.documentElement.lang = LANG;
  const EN = {
    // colores y direcciones
    roja: 'red', azul: 'blue', amarilla: 'yellow', verde: 'green', blanca: 'white',
    arriba: 'up', abajo: 'down', izquierda: 'left', derecha: 'right',
    // tutorial
    'Esto es pintura atrapada. Toca la flecha: corre hacia donde apunta y sale por la puerta de su color.': 'This is trapped paint. Tap the arrow: it runs the way it points and leaves through the door of its color.',
    '¿Ves? La sala recupera un poco de color. Esta va hacia abajo: a la puerta azul.': 'See? The room gets a little color back. This one goes down, to the blue door.',
    'La última. Vacía la sala.': 'The last one. Empty the room.',
    'Esta flecha está tapada: si la tocas, choca y no sale.': 'This arrow is blocked: tap it and it bumps, it doesn’t get out.',
    'Y cada toque gasta un movimiento, salga o no la flecha.': 'And every tap costs a move, whether the arrow gets out or not.',
    'Primero, libera el camino.': 'First, clear the way.',
    'Ahora sí: sale por su puerta.': 'Now it works: out through its door.',
    '¡Eso es! Ahora saca las que quedan tú solo. Antes de tocar, mira si el camino hasta su puerta está libre.': 'That’s it! Now get the rest out on your own. Before tapping, check the path to its door is clear.',
    'Cada flecha sale solo por la puerta de su color. El símbolo también lo dice: ● rojo, ■ azul, ★ amarillo, ◆ verde.': 'Each arrow only leaves through the door of its color. The symbol tells you too: ● red, ■ blue, ★ yellow, ◆ green.',
    'Ahora las puertas son más cortas: la flecha tiene que apuntar justo a una de su color.': 'Now the doors are shorter: the arrow has to point right at one of its color.',
    '<b>Nuevo</b> · Esta puerta es un portal (la del contorno discontinuo que se mueve): lo que entra no se va, cae a la capa de abajo.': '<b>New</b> · This door is a portal (the one with the moving dashed outline): what goes in doesn’t leave, it falls to the layer below.',
    'Cae aquí, en su carril. La primera que llega se queda al fondo y será la primera en salir.': 'It lands here, in its lane. The first to arrive goes to the back and will be the first out.',
    'Mándala por el portal.': 'Send it through the portal.',
    'Para mirar la capa de abajo, desliza hacia arriba o toca el 2. Para volver, desliza hacia abajo o toca el 1.': 'To look at the layer below, swipe up or tap 2. To come back, swipe down or tap 1.',
    '<b>Vista 3D</b>: muestra todas las capas apiladas. Arrastra para girar la pila, pellizca para acercarla y toca una capa para entrar en ella. Vuelve a tocar este botón para salir.': '<b>3D view</b>: shows all the layers stacked. Drag to turn the stack, pinch to zoom and tap a layer to enter it. Tap this button again to leave.',
    'Ya estás abajo: juegas con lo que mandaste desde arriba, más las piezas de esta capa.': 'You’re downstairs now: you play with what you sent from above, plus this layer’s pieces.',
    '<b>Nuevo</b> · Portal blanco: acepta flechas de cualquier color.': '<b>New</b> · White portal: it takes arrows of any color.',
    'Esta puerta pide el color de su píldora; las rayas de al lado son los que vendrán, en orden. Cada flecha que sale gasta una raya y la puerta toma el color de la siguiente.': 'This door asks for the color of its pill; the stripes beside it are the ones coming next, in order. Each arrow that leaves uses up a stripe and the door takes the next color.',
    'Abajo sale primero la que llegó primero. Así que manda las de arriba en el mismo orden que pide la puerta.': 'Below, first in is first out. So send the ones above in the same order the door asks for.',
    'Si te equivocas y ya no hay salida, rebobina la capa: vuelve a como estaba al empezarla.': 'If you get it wrong and there’s no way out, rewind the layer: it goes back to how it was when you started it.',
    '<b>Nuevo</b> · Esto es un girador. Venga de donde venga (flechas finas), la flecha que pasa por encima sale hacia donde marca la flecha gruesa.': '<b>New</b> · This is a turner. Wherever it comes from (thin arrows), an arrow passing over it leaves the way the thick arrow points.',
    'Mira su recorrido (la línea de puntos): entra en el girador y tuerce hasta su puerta. Tócala.': 'Look at its path (the dotted line): it enters the turner and bends to its door. Tap it.',
    'Truco: <b>mantén pulsada</b> una flecha para ver su recorrido sin moverla.': 'Tip: <b>press and hold</b> an arrow to see its path without moving it.',
    '<b>Nuevo</b> · Este portal salta capas: lo que entra no cae en la siguiente, sino más abajo. La letra te dice dónde sale: busca la misma letra en la otra capa (y en la leyenda de arriba).': '<b>New</b> · This portal skips layers: what goes in doesn’t fall to the next one but further down. The letter tells you where it comes out: look for the same letter on the other layer.',
    '<b>Nuevo</b> · Las flechas de abajo que salen por esta puerta también gastan sus rayas. Cuenta con ellas antes de mandar las de arriba.': '<b>New</b> · Arrows down here that leave through this door use up its stripes too. Count them before sending the ones above.',
    // salas: espacio, sala, frase, objeto
    'La oficina': 'The office', 'El centro comercial': 'The mall', 'La piscina cubierta': 'The indoor pool', 'El laboratorio': 'The lab',
    'Recepción': 'Reception', 'El pasillo': 'The corridor', 'Sala de reuniones': 'Meeting room', 'El archivo': 'The archive',
    'Las escaleras mecánicas': 'The escalators', 'La fuente': 'The fountain', 'El patio de comidas': 'The food court', 'El aparcamiento': 'The car park',
    'Los vestuarios': 'The changing rooms', 'La piscina': 'The pool', 'La mesa de giros': 'The turning table', 'El salto': 'The jump',
    'El orden de lejos': 'Order from afar', 'Cuatro capas': 'Four layers',
    'Se encienden las luces de la recepción.': 'The reception lights come on.', 'El pasillo vuelve a oler a café.': 'The corridor smells of coffee again.',
    'Alguien ha dejado flores en la mesa.': 'Someone left flowers on the table.', 'Las carpetas vuelven a tener color.': 'The folders have color again.',
    'Las escaleras vuelven a moverse.': 'The escalators move again.', 'La fuente vuelve a sonar.': 'The fountain sings again.',
    'Huele a pan recién hecho.': 'It smells of fresh bread.', 'Los coches tienen adónde volver.': 'The cars have somewhere to come back to.',
    'Hay toallas de colores en los bancos.': 'There are colorful towels on the benches.', 'El agua vuelve a ser azul.': 'The water is blue again.',
    'Se encienden las lámparas de la mesa.': 'The desk lamps come on.', 'Los matraces vuelven a burbujear.': 'The flasks bubble again.',
    'La planta del rincón reverdece.': 'The plant in the corner turns green again.', 'La máquina del fondo se enciende.': 'The machine at the back switches on.',
    'la lámpara': 'the lamp', 'la cafetera': 'the coffee maker', 'las flores': 'the flowers', 'las carpetas': 'the folders',
    'las escaleras': 'the escalators', 'la fuente': 'the fountain', 'el puesto de comida': 'the food stall', 'el coche': 'the car',
    'las toallas': 'the towels', 'el agua': 'the water', 'los matraces': 'the flasks', 'la planta': 'the plant', 'la máquina': 'the machine',
    // niveles
    'Primeros pasos': 'First steps', 'Una capa: color y dirección': 'One layer: color and direction',
    'Portales': 'Portals', 'Dos capas: lo que sale de arriba cae abajo': 'Two layers: what leaves above falls below',
    'El orden manda': 'Order matters', 'Portales blancos y puertas que cambian de color': 'White portals and doors that change color',
    'Laboratorio': 'Lab', 'Giradores, portales que saltan capas y hasta 4 capas': 'Turners, portals that skip layers and up to 4 layers',
    // historia
    'Se fue el color': 'The color left', 'Un día, el edificio se quedó en silencio: la oficina, el centro comercial, la piscina… todo gris.': 'One day the building fell silent: the office, the mall, the pool… all grey.',
    'Queda pintura': 'Some paint is left', 'El color está atrapado en flechas. Cada tablero es el suelo de una sala: saca las flechas por su puerta y lo que había en ella recupera su color.': 'The color is trapped in arrows. Each board is the floor of a room: get the arrows out through their door and what was in the room gets its color back.',
    'Hacia abajo': 'Going down', 'Algunas puertas no dan a la calle: dan a la sala de abajo. Lo que mandas cae allí. Baja, capa a capa.': 'Some doors don’t lead outside: they lead to the room below. What you send falls there. Go down, layer by layer.',
    // botones y rótulos
    'Niveles': 'Levels', 'Silenciar': 'Mute', 'Activar sonido': 'Unmute', 'Rebobinar capa': 'Rewind layer', 'Capas': 'Layers', 'Tablero': 'Board',
    'Todas las capas en 3D': 'All layers in 3D', 'Ver todas las capas en 3D': 'See all layers in 3D', 'Saltar': 'Skip', 'Siguiente': 'Next',
    'Entendido': 'Got it', 'Empezar': 'Start', 'Inicio': 'Home', 'Otra vez': 'Again', 'Reintentar': 'Retry', 'Reintentar nivel': 'Retry level',
    'Jugar otra vez': 'Play again', 'Siguiente nivel': 'Next level', 'Sin movimientos': 'Out of moves', 'Ver la capa de abajo': 'See the layer below',
    'Repetir tutorial': 'Replay tutorial', 'Jugar': 'Play', 'Modo infinito': 'Endless mode', 'Danos tu opinión': 'Tell us what you think',
    'Enviar datos de juego anónimos': 'Send anonymous gameplay data', 'Dos preguntas rápidas': 'Two quick questions',
    '¿En qué se parece o se diferencia de otros juegos de flechas que conozcas?': 'How is it similar to, or different from, other arrow games you know?',
    'Si no conoces ninguno, dinos qué te ha parecido': 'If you don’t know any, tell us what you thought', '¿Seguirías jugando?': 'Would you keep playing?',
    'Sí': 'Yes', 'Quizá': 'Maybe', 'No': 'No', 'Ahora no': 'Not now', 'Enviar': 'Send', '¡Gracias!': 'Thank you!', 'Nos ayuda mucho.': 'It helps us a lot.', 'Seguir': 'Continue',
    'Arrastra para girar · pellizca para acercar · toca una capa para entrar': 'Drag to turn · pinch to zoom · tap a layer to enter',
    'Así va la capa de abajo · desliza hacia abajo o toca para volver': 'This is the layer below · swipe down or tap to go back',
    'Desliza hacia arriba para ver la capa de abajo': 'Swipe up to see the layer below',
    '¿Hasta dónde bajas?': 'How deep can you go?', '¡Nuevo récord!': 'New record!', 'Fin de la partida': 'Game over',
    'Así ya no sale': 'No way out now', 'Con lo que ha caído, la capa de abajo no se puede vaciar.': 'With what has fallen, the layer below can’t be emptied.',
    'No he podido generar la pila': 'Couldn’t build the stack', 'No he podido generar la siguiente capa': 'Couldn’t build the next layer',
    'Sin un solo choque.': 'Not a single bump.', 'Has devuelto el color a todo el edificio. Fin del prototipo.': 'You brought the color back to the whole building. End of the prototype.',
    ' Fin del prototipo.': ' End of the prototype.', 'Nivel superado. ': 'Level cleared. ',
  };
  const tx = (es) => (LANG === 'en' ? EN[es] ?? es : es);
  const tr = (es, en) => (LANG === 'en' ? en : es);
  root.I18N = { LANG, tx, tr, set(l) { try { localStorage.setItem('po-lang', l); } catch {} location.reload(); } };
})(this);
