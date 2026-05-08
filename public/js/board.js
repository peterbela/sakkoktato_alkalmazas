// --- Sakktábla generálás ---
function generateChessboard() {
  const board = document.getElementById("chessboard");
  board.innerHTML = "";

  const files = "abcdefgh";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      // mező színe
      if ((row + col) % 2 === 0) {
        square.classList.add("white");
      } else {
        square.classList.add("black");
      }

      square.dataset.row = row;
      square.dataset.col = col;

      // mezőjelölések
      const rank = 8 - row; // 8 felül → 1 alul
      const file = files[col]; // a–h balról jobbra

      // BAL SZÉLSŐ OSZLOP: szám (rank)
      if (col === 0) {
        const rankDiv = document.createElement("div");
        rankDiv.classList.add("square-rank");
        rankDiv.textContent = rank;
        square.appendChild(rankDiv);
      }

      // ALSÓ SOR: betű (file)
      if (row === 7) {
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("square-file");
        fileDiv.textContent = file;
        square.appendChild(fileDiv);
      }

      square.addEventListener("click", onSquareClick);

      board.appendChild(square);
    }
  }

  renderPieces();
}

// --- Bábuk kirajzolása boardState alapján ---
function renderPieces() {
  const squares = document.querySelectorAll(".square");

  // csak a korábbi bábu-képeket töröljük, a jelöléseket NEM
  squares.forEach((sq) => {
    const imgs = sq.querySelectorAll("img");
    imgs.forEach((img) => img.remove());
  });

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece) {
        const selector =
          '.square[data-row="' + row + '"][data-col="' + col + '"]';
        const square = document.querySelector(selector);
        if (!square) continue;
        const img = document.createElement("img");
        img.src = PIECE_IMAGES[piece.code];
        img.alt = piece.code;
        square.appendChild(img);
      }
    }
  }
}

function clearBoardState() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      boardState[r][c] = null;
    }
  }
}
function clearHighlights() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((sq) => {
    sq.classList.remove(
      "highlight-move",
      "highlight-capture",
      "selected-square"
    );
  });
}
function setupBoardForLesson(id) {
  if (id === "intro") {
    setStartingPosition();
    return;
  }

  if (id === "board") {
    return; // üres tábla
  }

  if (id === "pawn") {
    boardState[6][4] = { code: "wP", type: "P", color: "white" }; // e2
    return;
  }

  if (id === "rook") {
  boardState[4][3] = { code: "wR", type: "R", color: "white" }; // d4 - jó bástya
  boardState[4][0] = { code: "wR", type: "R", color: "white" }; // a4 - zavaró bástya
  boardState[1][3] = { code: "bN", type: "N", color: "black" }; // d7 - célpont

  boardState[6][3] = { code: "wP", type: "P", color: "white" }; // d2
  boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7
  boardState[1][7] = { code: "bP", type: "P", color: "black" }; // h7
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  return;
}

  if (id === "bishop") {
    boardState[7][2] = { code: "wB", type: "B", color: "white" }; // c1
    boardState[3][6] = { code: "bP", type: "P", color: "black" }; // g5
    return;
  }

  if (id === "knight") {
    boardState[7][6] = { code: "wN", type: "N", color: "white" }; // g1
    return;
  }

  if (id === "queen") {
    boardState[7][3] = { code: "wQ", type: "Q", color: "white" }; // d1
    boardState[3][7] = { code: "bP", type: "P", color: "black" }; // h5
    return;
  }

  if (id === "king") {
    boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
    return;
  }

 if (id === "rules") {
  // Életszerűbb, középjáték-szerű állás sakkadás gyakorlásához.
  boardState[0][0] = { code: "bR", type: "R", color: "black" }; // a8
  boardState[0][2] = { code: "bB", type: "B", color: "black" }; // c8
  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  boardState[0][7] = { code: "bR", type: "R", color: "black" }; // h8

  boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7
  boardState[1][1] = { code: "bP", type: "P", color: "black" }; // b7
  boardState[1][3] = { code: "bP", type: "P", color: "black" }; // d7
  boardState[1][6] = { code: "bP", type: "P", color: "black" }; // g7
  boardState[1][7] = { code: "bP", type: "P", color: "black" }; // h7

  boardState[2][2] = { code: "bN", type: "N", color: "black" }; // c6
  boardState[2][5] = { code: "bN", type: "N", color: "black" }; // f6

  boardState[7][3] = { code: "wQ", type: "Q", color: "white" }; // d1

  boardState[4][2] = { code: "wB", type: "B", color: "white" }; // c4
  boardState[5][5] = { code: "wN", type: "N", color: "white" }; // f3

  boardState[6][0] = { code: "wP", type: "P", color: "white" }; // a2
  boardState[6][1] = { code: "wP", type: "P", color: "white" }; // b2
  boardState[6][3] = { code: "wP", type: "P", color: "white" }; // d2
  boardState[6][5] = { code: "wP", type: "P", color: "white" }; // f2
  boardState[6][6] = { code: "wP", type: "P", color: "white" }; // g2
  boardState[6][7] = { code: "wP", type: "P", color: "white" }; // h2

  boardState[7][0] = { code: "wR", type: "R", color: "white" }; // a1
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
  boardState[7][7] = { code: "wR", type: "R", color: "white" }; // h1
  return;
}

}
function setupBoardForTask(lessonId, task) {
  const positionKey = task ? task.position_key : null;

  if (positionKey === "rook_basic") {
    boardState[4][3] = { code: "wR", type: "R", color: "white" }; // d4
    boardState[1][3] = { code: "bN", type: "N", color: "black" }; // d7
    boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
    boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
    return;
  }

  if (positionKey === "rook_two_rooks") {
    boardState[4][3] = { code: "wR", type: "R", color: "white" }; // d4 - jó bástya
    boardState[4][0] = { code: "wR", type: "R", color: "white" }; // a4 - zavaró bástya
    boardState[1][3] = { code: "bN", type: "N", color: "black" }; // d7

    boardState[6][3] = { code: "wP", type: "P", color: "white" }; // d2
    boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7
    boardState[1][7] = { code: "bP", type: "P", color: "black" }; // h7
    boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
    boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
    return;
  }

  if (positionKey === "bishop_two_captures") {
  boardState[4][3] = { code: "wB", type: "B", color: "white" }; // d4

  boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7 - csali gyalog
  boardState[1][6] = { code: "bB", type: "B", color: "black" }; // g7 - cél futó

  boardState[6][1] = { code: "wP", type: "P", color: "white" }; // b2
  boardState[6][5] = { code: "wP", type: "P", color: "white" }; // f2
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1

  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  boardState[1][3] = { code: "bP", type: "P", color: "black" }; // d7
  boardState[2][7] = { code: "bP", type: "P", color: "black" }; // h6
  return;
}

if (positionKey === "knight_center_options") {
  boardState[4][3] = { code: "wN", type: "N", color: "white" }; // d4 - huszár

  boardState[2][2] = { code: "wP", type: "P", color: "white" }; // c6 - saját bábu, ide nem léphet
  boardState[3][1] = { code: "bP", type: "P", color: "black" }; // b5 - üthető
  boardState[5][1] = { code: "bB", type: "B", color: "black" }; // b3 - üthető
  boardState[2][4] = { code: "bP", type: "P", color: "black" }; // e6 - üthető

  boardState[6][4] = { code: "wP", type: "P", color: "white" }; // e2
  boardState[6][6] = { code: "wP", type: "P", color: "white" }; // g2
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1

  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  boardState[1][6] = { code: "bP", type: "P", color: "black" }; // g7
  return;
}

if (positionKey === "knight_block_check") {
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
  boardState[0][4] = { code: "bR", type: "R", color: "black" }; // e8 - sakkot ad
  boardState[0][6] = { code: "bK", type: "K", color: "black" }; // g8

  boardState[5][2] = { code: "wN", type: "N", color: "white" }; // c3 - e2-re lép
  boardState[6][0] = { code: "wP", type: "P", color: "white" }; // a2
  boardState[6][1] = { code: "wP", type: "P", color: "white" }; // b2
  boardState[6][6] = { code: "wP", type: "P", color: "white" }; // g2
  boardState[7][0] = { code: "wR", type: "R", color: "white" }; // a1

  boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7
  boardState[1][5] = { code: "bP", type: "P", color: "black" }; // f7
  boardState[2][2] = { code: "bB", type: "B", color: "black" }; // c6
  return;
}

if (positionKey === "knight_capture_piece") {
  boardState[4][4] = { code: "wN", type: "N", color: "white" }; // e4

  boardState[2][5] = { code: "bQ", type: "Q", color: "black" }; // f6 - célpont
  boardState[3][2] = { code: "bP", type: "P", color: "black" }; // c5 - másik üthető bábu
  boardState[5][2] = { code: "wP", type: "P", color: "white" }; // c3 - saját bábu, oda nem léphet

  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
  boardState[7][0] = { code: "wR", type: "R", color: "white" }; // a1
  boardState[6][3] = { code: "wP", type: "P", color: "white" }; // d2
  boardState[6][5] = { code: "wP", type: "P", color: "white" }; // f2

  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  boardState[0][0] = { code: "bR", type: "R", color: "black" }; // a8
  boardState[1][6] = { code: "bP", type: "P", color: "black" }; // g7
  return;
}
  setupBoardForLesson(lessonId);
}

function setStartingPosition() {
  clearBoardState();
  clearHighlights();
  selectedSquare = null;
  currentTurn = "white";
  updateTurnUi();


  // Fekete fő bábuk (8. sor = row 0)
  const blackBackRank = ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"];
  for (let col = 0; col < 8; col++) {
    const code = blackBackRank[col];
    boardState[0][col] = {
      code: code,
      type: code[1],
      color: "black",
    };
  }

  // Fekete gyalogok (7. sor = row 1)
  for (let col = 0; col < 8; col++) {
    boardState[1][col] = {
      code: "bP",
      type: "P",
      color: "black",
    };
  }

  // Fehér gyalogok (2. sor = row 6)
  for (let col = 0; col < 8; col++) {
    boardState[6][col] = {
      code: "wP",
      type: "P",
      color: "white",
    };
  }

  // Fehér fő bábuk (1. sor = row 7)
  const whiteBackRank = ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"];
  for (let col = 0; col < 8; col++) {
    const code = whiteBackRank[col];
    boardState[7][col] = {
      code: code,
      type: code[1],
      color: "white",
    };
  }

  renderPieces();
}
// --- Véletlen állás: 1 "fő" bábu + még 3 random bábu ---
function placeRandomPosition() {
  clearBoardState();
  clearHighlights();
  selectedSquare = null;
  setTask(null);

  // számlálók: hány király / gyalog van színenként
  let whiteKing = 0;
  let blackKing = 0;
  let whitePawns = 0;
  let blackPawns = 0;

  // --- FŐ BÁBU (amin kattintani fogsz) ---
  let mainRow, mainCol, mainKey, mainColor, mainType;

  while (true) {
    mainRow = Math.floor(Math.random() * 8);
    mainCol = Math.floor(Math.random() * 8);

    mainKey = piecesList[Math.floor(Math.random() * piecesList.length)];
    mainColor = mainKey[0] === "w" ? "white" : "black";
    mainType = mainKey[1]; // K, Q, R, B, N, P

    // király limit: színenként max 1
    if (mainType === "K") {
      if (mainColor === "white" && whiteKing >= 1) continue;
      if (mainColor === "black" && blackKing >= 1) continue;
    }

    // gyalog limit + ésszerű sorok
    if (mainType === "P") {
      // ne legyen fehér gyalog az utolsó sorban
      if (mainColor === "white" && mainRow === 7) continue;

      // ne legyen fekete gyalog az első sorban
      if (mainColor === "black" && mainRow === 0) continue;

      // darabszám limit: max 8 színenként
      if (mainColor === "white" && whitePawns >= 8) continue;
      if (mainColor === "black" && blackPawns >= 8) continue;
    }

    break; // ha idáig eljutottunk, elfogadjuk
  }

  boardState[mainRow][mainCol] = {
    code: mainKey,
    type: mainType,
    color: mainColor,
  };

  // számlálók frissítése
  if (mainType === "K") {
    if (mainColor === "white") whiteKing++;
    else blackKing++;
  }
  if (mainType === "P") {
    if (mainColor === "white") whitePawns++;
    else blackPawns++;
  }

  // --- Még 3 random bábu ---
  for (let i = 0; i < 3; i++) {
    let r, c, key, color, type;

    while (true) {
      r = Math.floor(Math.random() * 8);
      c = Math.floor(Math.random() * 8);
      if (boardState[r][c] !== null) continue;

      key = piecesList[Math.floor(Math.random() * piecesList.length)];
      color = key[0] === "w" ? "white" : "black";
      type = key[1];

      // király limit: összesen max 2 király, és színenként max 1
      if (type === "K") {
        const totalKings = whiteKing + blackKing;
        if (totalKings >= 2) {
          continue;
        }
        if (color === "white" && whiteKing >= 1) continue;
        if (color === "black" && blackKing >= 1) continue;

        // ne legyen a másik király mellett
        let ok = true;
        for (let rr = 0; rr < 8; rr++) {
          for (let cc = 0; cc < 8; cc++) {
            const p = boardState[rr][cc];
            if (p && p.type === "K") {
              if (kingsAreAdjacent(r, c, rr, cc)) {
                ok = false;
              }
            }
          }
        }
        if (!ok) continue;
      }

      // gyalog limit + ésszerű sorok
      if (type === "P") {
        if (color === "white" && r === 7) continue;
        if (color === "black" && r === 0) continue;

        if (color === "white" && whitePawns >= 8) continue;
        if (color === "black" && blackPawns >= 8) continue;
      }

      break; // elfogadható hely + figura
    }

    boardState[r][c] = {
      code: key,
      type: type,
      color: color,
    };

    // számlálók frissítése
    if (type === "K") {
      if (color === "white") whiteKing++;
      else blackKing++;
    }
    if (type === "P") {
      if (color === "white") whitePawns++;
      else blackPawns++;
    }
  }

  renderPieces();
}
