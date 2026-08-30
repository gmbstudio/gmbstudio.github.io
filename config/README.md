# config/telemetry.json

A dónde mandan la telemetría las apps de gmbStudio. Se lee en caliente para
poder mover el receptor **sin sacar versión de cada app**.

Para moverlo: cambia `events`, commit y push. Las apps lo recogen en su
siguiente arranque (releen como mucho una vez al día).

## Por qué vive aquí y no en el propio receptor

Porque GitHub Pages (185.199.x) es una **ruta de red distinta** a la del
receptor. El 2026-08-30 comprobamos que, con las IPs del receptor bloqueadas por
el operador, esto se seguía leyendo sin problema. Ponerlo en el receptor no
serviría de nada: si está bloqueado, tampoco llegarías a la configuración.

## Por qué el token NO está aquí

Se planteó por si un receptor nuevo usara otro, y se descartó: los dos extremos
son nuestros, así que puede aceptar el mismo que ya llevan compilado las apps.
Publicarlo solo lo haría más fácil de encontrar sin dar ninguna capacidad nueva.

Con el token de app solo se puede **escribir** (`/e` y `POST /device`); leer
cualquier cosa exige el de administración, que no viaja en ningún binario.

## Reglas que respetan los clientes

- Solo se acepta `https://`. Cualquier otra cosa se ignora.
- Tres niveles: URL compilada (suelo) → última leída correctamente → la de ahora.
- Si esto no se puede leer, cada app sigue con lo que tenía. Nunca se queda muda.
