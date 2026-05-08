// Rajta van-e a táblán?
function inBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}
// két király egymás mellett áll-e (átlósan is)
function kingsAreAdjacent(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}
function findKing(color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && piece.type === "K" && piece.color === color) {
        return { row, col };
      }
    }
  }

  return null;
}
function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);

  let row = fromRow + rowStep;
  let col = fromCol + colStep;

  while (row !== toRow || col !== toCol) {
    if (boardState[row][col]) {
      return false;
    }

    row += rowStep;
    col += colStep;
  }

  return true;
}

function pieceAttacksSquare(piece, fromRow, fromCol, targetRow, targetCol) {
  const rowDiff = targetRow - fromRow;
  const colDiff = targetCol - fromCol;
  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);

  if (piece.type === "P") {
    const dir = piece.color === "white" ? -1 : 1;
    return rowDiff === dir && absCol === 1;
  }

  if (piece.type === "N") {
    return (
      (absRow === 2 && absCol === 1) ||
      (absRow === 1 && absCol === 2)
    );
  }

  if (piece.type === "K") {
    return absRow <= 1 && absCol <= 1;
  }

  if (piece.type === "R") {
    if (fromRow !== targetRow && fromCol !== targetCol) return false;
    return isPathClear(fromRow, fromCol, targetRow, targetCol);
  }

  if (piece.type === "B") {
    if (absRow !== absCol) return false;
    return isPathClear(fromRow, fromCol, targetRow, targetCol);
  }

  if (piece.type === "Q") {
    const straight = fromRow === targetRow || fromCol === targetCol;
    const diagonal = absRow === absCol;

    if (!straight && !diagonal) return false;
    return isPathClear(fromRow, fromCol, targetRow, targetCol);
  }

  return false;
}
function isSquareAttacked(row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = boardState[r][c];

      if (!piece || piece.color !== byColor) {
        continue;
      }

      if (pieceAttacksSquare(piece, r, c, row, col)) {
        return true;
      }
    }
  }

  return false;
}

function isKingInCheck(color) {
  const king = findKing(color);

  if (!king) {
    return false;
  }

  const enemyColor = color === "white" ? "black" : "white";
  return isSquareAttacked(king.row, king.col, enemyColor);
}
