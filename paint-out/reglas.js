// Réplica en JS de las reglas y el solucionador de Core/ (Swift). Si no coinciden, manda Swift:
// node artefactos/check-reglas.js compara este fichero con los informes que exporta Swift.
(function (root) {
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const WHITE = 'white';
  const vertical = (d) => d === 'up' || d === 'down';

  function cells(a) {
    const [dx, dy] = DIRS[a.dir];
    return Array.from({ length: a.len }, (_, i) => [a.x - dx * i, a.y - dy * i]);
  }

  function laneCell(lane, d, w, h) {
    switch (lane.edge) {
      case 'up': return [lane.index, d];
      case 'down': return [lane.index, h - 1 - d];
      case 'left': return [d, lane.index];
      default: return [w - 1 - d, lane.index];
    }
  }

  // Recorrido de una flecha hasta salir por un borde, torciendo en los giradores (= Layer.route en Swift).
  function route(l, a) {
    const turn = new Map((l.turners || []).map((t) => [t.x + ',' + t.y, t.dir]));
    let x = a.x, y = a.y, d = a.dir; const path = [];
    for (let s = 0; s < l.w * l.h * 2; s++) {
      const [dx, dy] = DIRS[d], nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= l.w || ny >= l.h) return { path, edge: d, index: vertical(d) ? x : y };
      path.push([nx, ny, d]); x = nx; y = ny;
      const t = turn.get(x + ',' + y); if (t) d = t;
    }
    return null;
  }
  const reach = (l, a) => { const r = route(l, a); return r ? l.doors.findIndex((d) => d.edge === r.edge && r.index >= d.from && r.index < d.from + d.len) : -1; };
  const hop = (d) => d.to || 1;

  // carried[j][carril]: lo ya mandado (por capas de más arriba) a la capa layer + 1 + j
  function makeBoard(level, layer, incoming, carried = []) {
    const l = level.layers[layer];
    const arrows = l.arrows.map((a) => ({ ...a }));
    l.lanes.forEach((lane, k) => {
      let depth = lane.len - 1; // la primera en llegar queda al fondo, apuntando hacia dentro
      for (const p of incoming[k]) {
        const [x, y] = laneCell(lane, depth, l.w, l.h);
        arrows.push({ x, y, dir: OPP[lane.edge], len: p.len, color: p.color, lane: k });
        depth -= p.len;
      }
    });
    const below = level.layers.slice(layer + 1);
    const sent = below.map((m, j) => (carried[j] ? carried[j].map((x) => x.slice()) : m.lanes.map(() => [])));
    // rejilla de ocupación (índice de flecha + 1 por casilla): el toque no recorre todas las flechas
    const grid = new Int16Array(l.w * l.h);
    arrows.forEach((a, i) => cells(a).forEach(([x, y]) => { if (x >= 0 && y >= 0 && x < l.w && y < l.h) grid[y * l.w + x] = i + 1; }));
    return {
      layer, incoming, arrows, grid, inKey: pieceKey(incoming),
      live: arrows.map(() => true),
      doorExits: l.doors.map(() => 0),
      sent, outgoing: sent[0] || [], // outgoing = lo que va a la capa siguiente
      caps: below.map((m) => m.lanes.map((x) => x.len)),
      w: l.w, h: l.h, doors: l.doors, lay: l,
    };
  }

  const pieceKey = (lanes) => lanes.map((l) => l.map((p) => p.color[0] + p.len).join('')).join('|');
  const doorColor = (d, exits) => d.colors[Math.min(exits, d.colors.length - 1)]; // secuencia finita: se gasta y se queda en el último
  const isEmpty = (b) => !b.live.some(Boolean);

  // Regla del toque. door: índice de la puerta o null si choca; steps: casillas libres hasta el obstáculo/borde.
  function probe(b, i) {
    const a = b.arrows[i];
    const r = route(b.lay, a);
    if (!r) return { door: null, steps: 0, path: [], blockedBy: 'wall' };
    let steps = 0;
    for (const [x, y] of r.path) {
      const o = b.grid[y * b.w + x];
      if (o && o !== i + 1) return { door: null, steps, path: r.path.slice(0, steps), blockedBy: 'arrow' };
      steps++;
    }
    const path = r.path, idx = r.index, edge = r.edge;
    const k = b.doors.findIndex((d) => d.edge === edge && idx >= d.from && idx < d.from + d.len);
    if (k < 0) return { door: null, steps, path, edge, blockedBy: 'wall' };
    const d = b.doors[k];
    const c = doorColor(d, b.doorExits[k]);
    if (c !== WHITE && c !== a.color) return { door: null, steps, path, edge, blockedBy: 'color', doorIndex: k };
    if (d.portal != null) {
      const j = hop(d) - 1, used = b.sent[j][d.portal].reduce((s, p) => s + p.len, 0);
      if (used + a.len > b.caps[j][d.portal]) return { door: null, steps, path, edge, blockedBy: 'full', doorIndex: k };
    }
    return { door: k, steps, path, edge };
  }

  function apply(b, i, k) {
    const sent = b.sent.map((m) => m.map((o) => o.slice()));
    const n = { ...b, live: b.live.slice(), doorExits: b.doorExits.slice(), sent, outgoing: sent[0] || [], grid: b.grid.slice() };
    n.live[i] = false;
    cells(b.arrows[i]).forEach(([x, y]) => { if (x >= 0 && y >= 0 && x < b.w && y < b.h) n.grid[y * b.w + x] = 0; });
    n.doorExits[k]++;
    const d = b.doors[k];
    if (d.portal != null) n.sent[hop(d) - 1][d.portal].push({ color: b.arrows[i].color, len: b.arrows[i].len });
    return n;
  }

  const keyOf = (b) => b.layer + '#' + b.inKey + '#' + b.live.map(Number).join('') + '#' + b.doorExits.join(',') + '#' + b.sent.map(pieceKey).join('/');

  // maxStates (solo para el generador del prototipo): si el espacio de estados crece más, se rinde lanzando un error.
  function Solver(level, { maxStates = Infinity } = {}) {
    const memo = new Map();
    const fillings = {};
    let failSum = 0;

    function evalB(b) {
      const key = keyOf(b);
      if (memo.has(key)) return memo.get(key);
      let n;
      if (isEmpty(b)) {
        if (b.layer + 1 === level.layers.length) n = { min: 0, p: 1 };
        else {
          n = evalB(makeBoard(level, b.layer + 1, b.outgoing, b.sent.slice(1)));
          (fillings[b.layer + 1] ||= new Map()).set(JSON.stringify(b.sent), n.min != null);
        }
      } else {
        const live = b.live.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
        const moves = [];
        for (const i of live) { const r = probe(b, i); if (r.door != null) moves.push([i, r.door]); }
        failSum += 1 - moves.length / live.length;
        let best = null, p = 0;
        for (const [i, k] of moves) {
          const r = evalB(apply(b, i, k));
          if (r.min != null) best = Math.min(best ?? Infinity, r.min + 1);
          p += r.p / moves.length;
        }
        n = { min: best, p };
      }
      memo.set(key, n);
      if (memo.size > maxStates) throw new Error('demasiados estados');
      return n;
    }

    return {
      minMoves: (b) => evalB(b).min,
      report() {
        const root = evalB(makeBoard(level, 0, []));
        let dead = 0;
        for (const v of memo.values()) if (v.min == null) dead++;
        const layers = level.layers.slice(1).map((_, i) => i + 1);
        return {
          solvable: root.min != null, minMoves: root.min, states: memo.size, deadEnds: dead,
          randomWin: root.p, failRate: failSum / Math.max(1, memo.size),
          fillings: layers.map((l) => (fillings[l] ? fillings[l].size : 0)),
          winnableFillings: layers.map((l) => (fillings[l] ? [...fillings[l].values()].filter(Boolean).length : 0)),
        };
      },
    };
  }

  const api = { DIRS, OPP, WHITE, cells, laneCell, makeBoard, probe, apply, isEmpty, doorColor, Solver, route, reach, hop };
  if (typeof module !== 'undefined') module.exports = api; else root.Reglas = api;
})(this);
