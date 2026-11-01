# Lo común de la web (no se publica: Jekyll no sirve las carpetas que empiezan por `_`)

Cada app gestiona su propia política en `<app>/privacy_policy.html` y toma de aquí lo que es igual en todas:

- `_layouts/politica.html` — cabecera, título, fecha, **Changes**, **Contact** y pie. La página de la app solo lleva
  su front matter (`layout: politica`, `title`, `app`, `updated`) y sus secciones propias.
- `_includes/telemetria-identidad.html` y `telemetria-garantias.html` — las garantías de la telemetría anónima propia
  (regla 12): sin identidad, servidor propio sin IP, sin rastreo, se apaga en Ajustes. Parámetros: `identificador`
  (si el identificador aleatorio se comporta distinto) y `donde` (dónde está el interruptor).

Referencia viva: `grismoor/privacy_policy.html` y `easy-iptv/privacy_policy.html`. Pendientes de pasar a este
sistema cuando sus sesiones toquen la política: `family-meal-planner/` y `pulse/` (en español: el layout es inglés).

Las sesiones de app leen esto pero no lo cambian (solo escriben en su carpeta); un cambio aquí afecta a todas las
apps y lo hace una sesión global con OK del admin.
