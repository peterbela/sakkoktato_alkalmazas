// --- Központi lépéslogika: eldönti, melyik függvényt hívjuk ---
function getMovesForPiece(piece, row, col) {
  const type = piece.type; // "K", "Q", "R", "B", "N", "P"
  const color = piece.color;

  if (type === "N") {
    return getKnightMoves(color, row, col);
  }
  if (type === "R") {
    return getRookMoves(color, row, col);
  }
  if (type === "B") {
    return getBishopMoves(color, row, col);
  }
  if (type === "Q") {
    return getQueenMoves(color, row, col);
  }
  if (type === "K") {
    return getKingMoves(color, row, col);
  }
  if (type === "P") {
    return getPawnMoves(color, row, col);
  }

  return [];
}
// --- Huszár lépései ---
function getKnightMoves(color, row, col) {
  const deltas = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];
  const moves = [];

  for (let i = 0; i < deltas.length; i++) {
    const dr = deltas[i][0];
    const dc = deltas[i][1];
    const nr = row + dr;
    const nc = col + dc;
    if (!inBounds(nr, nc)) continue;

    const target = boardState[nr][nc];
    if (!target) {
      moves.push({ row: nr, col: nc, isCapture: false });
    } else if (target.color !== color) {
      moves.push({ row: nr, col: nc, isCapture: true });
    }
  }

  return moves;
}

// --- Bástya lépései (egyenes vonalak, blokkolás + ütés) ---
function getRookMoves(color, row, col) {
  const moves = [];
  const directions = [
    [1, 0], // le
    [-1, 0], // fel
    [0, 1], // jobb
    [0, -1], // bal
  ];

  for (let i = 0; i < directions.length; i++) {
    const dr = directions[i][0];
    const dc = directions[i][1];

    let nr = row + dr;
    let nc = col + dc;

    while (inBounds(nr, nc)) {
      const target = boardState[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, isCapture: false });
      } else {
        if (target.color !== color) {
          moves.push({ row: nr, col: nc, isCapture: true });
        }
        break; // saját vagy ellenfél bábu blokkol
      }

      nr += dr;
      nc += dc;
    }
  }

  return moves;
}

// --- Futó lépései (átlók, blokkolás + ütés) ---
function getBishopMoves(color, row, col) {
  const moves = [];
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  for (let i = 0; i < directions.length; i++) {
    const dr = directions[i][0];
    const dc = directions[i][1];

    let nr = row + dr;
    let nc = col + dc;

    while (inBounds(nr, nc)) {
      const target = boardState[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, isCapture: false });
      } else {
        if (target.color !== color) {
          moves.push({ row: nr, col: nc, isCapture: true });
        }
        break;
      }

      nr += dr;
      nc += dc;
    }
  }

  return moves;
}

// --- Vezér lépései (bástya + futó kombináció) ---
function getQueenMoves(color, row, col) {
  const rookMoves = getRookMoves(color, row, col);
  const bishopMoves = getBishopMoves(color, row, col);
  return rookMoves.concat(bishopMoves);
}

// --- Király lépései (1 mező bármely irányban, blokkolással + király melletti tiltás) ---
function getKingMoves(color, row, col) {
  const moves = [];

  // másik király koordinátáinak megkeresése
  let otherKing = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = boardState[r][c];
      if (p && p.type === "K" && p.color !== color) {
        otherKing = { row: r, col: c };
      }
    }
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!inBounds(nr, nc)) continue;

      // király nem léphet a másik király mellé
      if (otherKing && kingsAreAdjacent(nr, nc, otherKing.row, otherKing.col)) {
        continue;
      }

      const target = boardState[nr][nc];
      if (!target) {
        moves.push({ row: nr, col: nc, isCapture: false });
      } else if (target.color !== color) {
        moves.push({ row: nr, col: nc, isCapture: true });
      }
    }
  }

  return moves;
}

// --- Gyalog lépései (előrelépés + ütés) ---
function getPawnMoves(color, row, col) {
  const moves = [];
  const dir = color === "white" ? -1 : 1; // fehér felfelé, fekete lefelé
  const startRow = color === "white" ? 6 : 1;

  // sima előrelépés
  const fwdRow = row + dir;
  if (inBounds(fwdRow, col) && !boardState[fwdRow][col]) {
    moves.push({ row: fwdRow, col: col, isCapture: false });

    // dupla lépés kezdősorról
    const fwd2Row = row + 2 * dir;
    if (
      row === startRow &&
      inBounds(fwd2Row, col) &&
      !boardState[fwd2Row][col]
    ) {
      moves.push({ row: fwd2Row, col: col, isCapture: false });
    }
  }

  // ütés átlósan
  const captureCols = [-1, 1];
  for (let i = 0; i < captureCols.length; i++) {
    const dc = captureCols[i];
    const nr = row + dir;
    const nc = col + dc;
    if (!inBounds(nr, nc)) continue;
    const target = boardState[nr][nc];
    if (target && target.color !== color) {
      moves.push({ row: nr, col: nc, isCapture: true });
    }
  }

  return moves;
}
