// Felváltva lépnek a világos és sötét bábuk
function getTurnLabel() {
  return currentTurn === "white" ? "Világos" : "Sötét";
}

function updateTurnUi() {
  const turnText = document.getElementById("turnText");
  if (turnText) {
    turnText.textContent = `${getTurnLabel()} következik.`;
  }
}

function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
  updateTurnUi();
}
// --- Kattintás egy mezőre: feladatkezelés + kijelöl + lép ---
function onSquareClick(e) {
  const square = e.currentTarget;
  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);
  const clickedPiece = boardState[row][col];

  // 1) Ha "kattints erre a mezőre" típusú feladat van
  if (currentTask && currentTask.type === "click-square") {
    const target = currentTask.target;
    if (target && target.row === row && target.col === col) {
      setTaskFeedback("✅ Ügyes! A jó mezőt választottad.", true);
      completeCurrentTask();
    } else {
      setTaskFeedback("❌ Ez most nem a keresett mező. Próbáld újra!", false);
    }
    // ilyen feladatnál nem mozgatunk bábukat
    return;
  }

  // 2) Innentől jön a sima lépés logika

  // Ha még nincs kiválasztott bábu
  if (!selectedSquare) {
    clearHighlights();

    if (!clickedPiece) {
      // üres mezőre kattintottunk → semmi
      return;
    }

    if (clickedPiece.color !== currentTurn) {
  setTaskFeedback(`${getTurnLabel()} következik, ezért most csak ${getTurnLabel().toLowerCase()} bábuval léphetsz.`, false);
  return;
}

    // kiválasztjuk a bábut
    selectedSquare = { row, col };
    square.classList.add("selected-square");

    const moves = getMovesForPiece(clickedPiece, row, col);

    moves.forEach((move) => {
      const target = document.querySelector(
        '.square[data-row="' + move.row + '"][data-col="' + move.col + '"]'
      );
      if (!target) return;
      if (move.isCapture) {
        target.classList.add("highlight-capture");
      } else {
        target.classList.add("highlight-move");
      }
    });

    return;
  }

  // Ha MÁR van kiválasztott bábu
  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;
  const selectedPiece = boardState[fromRow][fromCol];

  // ha ugyanarra kattintunk, mint ami ki volt jelölve → megszüntetjük a kijelölést
  if (fromRow === row && fromCol === col) {
    clearHighlights();
    selectedSquare = null;
    return;
  }

  // kiszámoljuk a kiválasztott bábu érvényes lépéseit
  const legalMoves = getMovesForPiece(selectedPiece, fromRow, fromCol);
  const targetMove = legalMoves.find((m) => m.row === row && m.col === col);

 if (targetMove) {
  const capturedPiece = boardState[row][col];

  if (capturedPiece && capturedPiece.type === "K") {
    setTaskFeedback("A királyt nem lehet leütni. Sakkot kell adni, nem levenni a tábláról.", false);
    selectedSquare = null;
    clearHighlights();
    return;
  }

  // Ideiglenesen végrehajtjuk a lépést, hogy ellenőrizni tudjuk a sakkhelyzetet.
  boardState[row][col] = selectedPiece;
  boardState[fromRow][fromCol] = null;

  if (isKingInCheck(selectedPiece.color)) {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    setTaskFeedback("Ezt a lépést nem teheted meg, mert a saját királyod sakkban maradna vagy sakkba kerülne.", false);
    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }

  if (currentTask && currentTask.type === "move-piece") {
    const t = currentTask;
    const correctFrom =
      t.from && t.from.row === fromRow && t.from.col === fromCol;
    const correctTo =
      t.to && t.to.row === row && t.to.col === col;

    if (correctFrom && correctTo) {
      setTaskFeedback(
        "✅ Szuper! Pontosan azt a lépést hajtottad végre, amit a feladat kért.",
        true
      );
      completeCurrentTask();
    } else {
      boardState[fromRow][fromCol] = selectedPiece;
      boardState[row][col] = capturedPiece;

      if (!correctFrom && currentTask.wrongPieceMessage) {
        setTaskFeedback(currentTask.wrongPieceMessage, false);
      } else if (!correctTo && currentTask.wrongTargetMessage) {
        setTaskFeedback(currentTask.wrongTargetMessage, false);
      } else {
        setTaskFeedback(
          currentTask.tacticalMessage ||
            "Ez a lépés szabályos volt, de nem oldja meg a feladatot.",
          false
        );
      }

      selectedSquare = null;
      clearHighlights();
      renderPieces();
      return;
    }
  }

  if (currentTask && currentTask.type === "two-step") {
    const step = currentTask.steps[currentStepIndex];

    const correctFrom =
      step.from.row === fromRow && step.from.col === fromCol;
    const correctTo =
      step.to.row === row && step.to.col === col;

    if (correctFrom && correctTo) {
      currentStepIndex++;

      if (currentStepIndex === currentTask.steps.length) {
        setTaskFeedback("✅ Kész! Mindkét lépés helyes volt.", true);
        completeCurrentTask();
      } else {
        setTaskFeedback("✅ Jó lépés! Most jön a következő.", true);

        const taskTextEl = document.getElementById("taskText");
        if (taskTextEl) {
          taskTextEl.textContent =
            currentTask.description +
            ` (${currentStepIndex + 1}. lépés)`;
        }
      }
    } else {
      boardState[fromRow][fromCol] = selectedPiece;
      boardState[row][col] = capturedPiece;

      setTaskFeedback("Ez szabályos lépés volt, de nem a feladatban kért lépéssor része.", false);
      selectedSquare = null;
      clearHighlights();
      renderPieces();
      return;
    }
  }

if (currentTask && currentTask.type === "two-turns") {
  const expectedColor = currentStepIndex === 0 ? "white" : "black";

  if (selectedPiece.color !== expectedColor) {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    setTaskFeedback(
      currentTask.tacticalMessage ||
        "Figyelj a lépéssorrendre: először világos, utána sötét következik.",
      false
    );

    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }

  currentStepIndex++;

  if (currentStepIndex === 1) {
    setTaskFeedback("✅ Jó lépés! Most sötét következik.", true);

    const taskTextEl = document.getElementById("taskText");
    if (taskTextEl) {
      taskTextEl.textContent =
        currentTask.description + " (2. lépés: sötét)";
    }
  } else {
    setTaskFeedback("✅ Kész! Világos és sötét is lépett szabályosan.", true);
    completeCurrentTask();
  }
}

  if (currentTask && currentTask.type === "give-check") {
  const targetColor = currentTask.targetColor || "black";

  const correctPieceType =
    !currentTask.requiredPieceType ||
    selectedPiece.type === currentTask.requiredPieceType;

  const correctPieceColor =
    !currentTask.requiredPieceColor ||
    selectedPiece.color === currentTask.requiredPieceColor;

  const gaveCheck = isKingInCheck(targetColor);

  if (gaveCheck && correctPieceType && correctPieceColor) {
    setTaskFeedback("✅ Jó lépés! A megadott bábuval sakkot adtál.", true);
    completeCurrentTask();
  } else {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    if (gaveCheck && (!correctPieceType || !correctPieceColor)) {
      setTaskFeedback(
        currentTask.wrongPieceMessage ||
          "Sakkot adtál, de nem azzal a bábuval, amit a feladat kért.",
        false
      );
    } else {
      setTaskFeedback(
        currentTask.wrongTargetMessage ||
          currentTask.tacticalMessage ||
          "Ez szabályos lépés volt, de nem adott sakkot.",
        false
      );
    }

    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }
}

  switchTurn();

  selectedSquare = null;
  clearHighlights();
  renderPieces();
  return;
}

  // Ha nem érvényes mezőre kattintottunk, de ott van egy SAJÁT bábu → váltunk kijelölést
  if (clickedPiece && clickedPiece.color === selectedPiece.color) {
    clearHighlights();
    selectedSquare = { row, col };
    square.classList.add("selected-square");

    const moves = getMovesForPiece(clickedPiece, row, col);
    moves.forEach((move) => {
      const target = document.querySelector(
        '.square[data-row="' + move.row + '"][data-col="' + move.col + '"]'
      );
      if (!target) return;
      if (move.isCapture) {
        target.classList.add("highlight-capture");
      } else {
        target.classList.add("highlight-move");
      }
    });
    return;
  }

  // különben: semmisítjük a kijelölést
  clearHighlights();
  selectedSquare = null;
}