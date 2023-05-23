export type Piece = {
  name: PieceName
  square: Square
  side: Side
}

export type Board = {
  pieces: Piece[]
  turn: Side
  width: number
  height: number
  moves: Move[]
}

export type Move =
  | {
      type: 'standard'
      piece: Piece
      captures: Piece | null
      from: Square
      to: Square
    }
  | {
      type: 'castle'
      piece: Piece
      from: Square
      to: Square
      rook: {
        piece: Piece
        from: Square
        to: Square
      }
    }

export type Side = 'black' | 'white'

export type Square = {
  x: number
  y: number
}

export type MovePattern = (piece: Piece, board: Board) => Move[]

export const isSameSquare = (a: Square, b: Square) => a.x === b.x && a.y === b.y

export const isSquareOnBoard = (square: Square, board: Board) => {
  return (
    square.x >= 0 &&
    square.y >= 0 &&
    square.x < board.width &&
    square.y < board.height
  )
}

export const getPieceOnSquare = (square: Square, board: Board) => {
  return board.pieces.find((piece) => isSameSquare(piece.square, square))
}

export const isSamePiece = (a: Piece | null, b: Piece | null): boolean => {
  if (!a) return false
  if (!b) return false
  return isSameSquare(a.square, b.square)
}

export const isValidMove = (move: Move, board: Board): boolean => {
  const moves = getLegalMovesForPiece(move.piece, board)
  return moves.some((m) => isSameSquare(move.to, m.to))
}

export const getMoveTargetSquare = (move: Move) => move.to

const getNumbersInBetween = (a: number, b: number) =>
  Array(Math.abs(a - b) - 1)
    .fill(null)
    .map((_, i) => i + Math.min(a, b) + 1)

export type MovePatternName =
  | 'diagonal'
  | 'cardinal'
  | 'knight'
  | 'pawn'
  | 'king'

export const MOVE_PATTERNS: { [name in MovePatternName]: MovePattern } = {
  diagonal: (piece, board) => {
    const moves: Move[] = []

    for (let [dx, dy] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as const) {
      for (
        let x = piece.square.x + dx, y = piece.square.y + dy;
        ;
        x += dx, y += dy
      ) {
        const square = { x, y }

        if (!isSquareOnBoard(square, board)) break

        const pieceOnSquare = getPieceOnSquare(square, board)
        if (pieceOnSquare) {
          if (pieceOnSquare.side !== piece.side) {
            moves.push({
              type: 'standard',
              piece,
              from: piece.square,
              to: square,
              captures: pieceOnSquare,
            })
          }
          break
        }

        moves.push({
          type: 'standard',
          piece,
          from: piece.square,
          to: square,
          captures: null,
        })
      }
    }

    return moves
  },

  cardinal: (piece: Piece, board: Board) => {
    const moves: Move[] = []

    for (let [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      for (
        let x = piece.square.x + dx, y = piece.square.y + dy;
        ;
        x += dx, y += dy
      ) {
        const square = { x, y }

        if (!isSquareOnBoard(square, board)) break

        const pieceOnSquare = getPieceOnSquare(square, board)
        if (pieceOnSquare) {
          if (pieceOnSquare.side !== piece.side) {
            moves.push({
              type: 'standard',
              piece,
              from: piece.square,
              to: square,
              captures: pieceOnSquare,
            })
          }
          break
        }

        moves.push({
          type: 'standard',
          piece,
          from: piece.square,
          to: square,
          captures: null,
        })
      }
    }

    return moves
  },

  knight: (piece, board) => {
    const moves: Move[] = []

    for (let [dx, dy] of [
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
    ] as const) {
      const square = { x: piece.square.x + dx, y: piece.square.y + dy }

      if (!isSquareOnBoard(square, board)) continue

      const pieceOnSquare = getPieceOnSquare(square, board)
      if (pieceOnSquare) {
        if (pieceOnSquare.side !== piece.side) {
          moves.push({
            type: 'standard',
            piece,
            from: piece.square,
            to: square,
            captures: pieceOnSquare,
          })
        }
        continue
      }

      moves.push({
        type: 'standard',
        piece,
        from: piece.square,
        to: square,
        captures: null,
      })
    }

    return moves
  },
  pawn: (piece, board) => {
    const moves: Move[] = []
    const yDirection = piece.side === 'white' ? 1 : -1

    // Default movement
    const square = {
      x: piece.square.x,
      y: piece.square.y + yDirection,
    }

    const pieceOnSquare = getPieceOnSquare(square, board)
    if (!pieceOnSquare) {
      moves.push({
        type: 'standard',
        piece,
        from: piece.square,
        to: square,
        captures: null,
      })

      if (!hasPieceMoved(piece, board)) {
        const doubleMove = {
          x: square.x,
          y: square.y + yDirection,
        }

        const pieceOnSquare = getPieceOnSquare(doubleMove, board)
        if (!pieceOnSquare) {
          moves.push({
            type: 'standard',
            piece,
            from: piece.square,
            to: doubleMove,
            captures: null,
          })
        }
      }
    }

    // Capturing
    for (const dx of [1, -1] as const) {
      const square = {
        x: piece.square.x + dx,
        y: piece.square.y + yDirection,
      }

      const pieceOnSquare = getPieceOnSquare(square, board)
      if (pieceOnSquare && pieceOnSquare.side !== piece.side) {
        moves.push({
          type: 'standard',
          piece,
          from: piece.square,
          to: square,
          captures: pieceOnSquare,
        })
      }
    }

    // En passant
    const lastMove = board.moves[board.moves.length - 1]
    if (lastMove && lastMove.type === 'standard') {
      const isPawn = lastMove.piece.name === 'pawn'
      const movedTwo = Math.abs(lastMove.from.y - lastMove.to.y) === 2
      const isNextToPiece = lastMove.to.y === piece.square.y

      if (isPawn && movedTwo && isNextToPiece) {
        moves.push({
          type: 'standard',
          piece,
          from: piece.square,
          to: {
            y: piece.square.y + yDirection,
            x: lastMove.to.x,
          },
          captures: getPieceOnSquare(lastMove.to, board)!,
        })
      }
    }

    return moves
  },

  king: (piece, board) => {
    const moves: Move[] = []

    for (let [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [1, 0],
      [-1, 1],
      [-1, -1],
      [-1, 0],
    ] as const) {
      const square = { x: piece.square.x + dx, y: piece.square.y + dy }

      if (!isSquareOnBoard(square, board)) continue

      const pieceOnSquare = getPieceOnSquare(square, board)
      if (pieceOnSquare) {
        if (pieceOnSquare.side !== piece.side) {
          moves.push({
            type: 'standard',
            piece,
            from: piece.square,
            to: square,
            captures: pieceOnSquare,
          })
        }
        continue
      }

      moves.push({
        type: 'standard',
        piece,
        from: square,
        to: square,
        captures: null,
      })
    }

    // Castling
    {
      if (!hasPieceMoved(piece, board)) {
        const rooks = board.pieces.filter(
          (p) =>
            p.side === piece.side &&
            p.name === 'rook' &&
            !hasPieceMoved(p, board)
        )

        for (const rook of rooks) {
          const hasPiecesBetweenKingAndRook = getNumbersInBetween(
            piece.square.x,
            rook.square.x
          ).some((x) =>
            getPieceOnSquare(
              {
                x,
                y: piece.square.y,
              },
              board
            )
          )

          if (hasPiecesBetweenKingAndRook) continue

          if (rook.square.x < piece.square.x) {
            // Queenside castle

            const isCorridorSafe = !isCheckForSide(
              piece.side,
              applyMove(
                {
                  type: 'standard',
                  piece: piece,
                  from: piece.square,
                  to: { x: piece.square.x - 1, y: piece.square.y },
                  captures: null,
                },
                board
              )
            )

            if (isCorridorSafe) {
              moves.push({
                type: 'castle',
                piece: piece,
                from: piece.square,
                to: { x: piece.square.x - 2, y: piece.square.y },

                rook: {
                  piece: rook,
                  from: rook.square,
                  to: { x: piece.square.x - 1, y: piece.square.y },
                },
              })
            }
          } else {
            // Kingside castle
            const isCorridorSafe = !isCheckForSide(
              piece.side,
              applyMove(
                {
                  type: 'standard',
                  piece: piece,
                  from: piece.square,
                  to: { x: piece.square.x + 1, y: piece.square.y },
                  captures: null,
                },
                board
              )
            )

            if (isCorridorSafe) {
              moves.push({
                type: 'castle',
                piece: piece,
                from: piece.square,
                to: { x: piece.square.x + 2, y: piece.square.y },

                rook: {
                  piece: rook,
                  from: rook.square,
                  to: { x: piece.square.x + 1, y: piece.square.y },
                },
              })
            }
          }
        }
      }
    }

    return moves
  },
}

export const PIECES = {
  king: {
    name: 'king',
    moveset: [MOVE_PATTERNS.king],
  },
  queen: {
    name: 'queen',
    moveset: [MOVE_PATTERNS.diagonal, MOVE_PATTERNS.cardinal],
  },
  bishop: {
    name: 'bishop',
    moveset: [MOVE_PATTERNS.diagonal],
  },
  rook: {
    name: 'rook',
    moveset: [MOVE_PATTERNS.cardinal],
  },
  knight: {
    name: 'knight',
    moveset: [MOVE_PATTERNS.knight],
  },
  pawn: {
    name: 'pawn',
    moveset: [MOVE_PATTERNS.pawn],
  },
} as const

export type PieceName = keyof typeof PIECES

const hasPieceMoved = (piece: Piece, board: Board): boolean =>
  board.moves.some((move): boolean => {
    switch (move.type) {
      case 'standard':
        return isSameSquare(move.to, piece.square)
      case 'castle':
        return (
          isSameSquare(move.to, piece.square) ||
          isSameSquare(move.rook.to, piece.square)
        )
    }
  })

export const getKingForSide = (side: Side, board: Board): Piece => {
  const king = board.pieces.find(
    (piece) => side === piece.side && piece.name === 'king'
  )

  if (!king) {
    throw new Error('Invalid board, no king found')
  }

  return king
}

export const getOppositeSide = (side: Side): Side =>
  side === 'white' ? 'black' : 'white'

export const applyMove = (move: Move, board: Board): Board => {
  switch (move.type) {
    case 'standard': {
      const pieces = board.pieces.filter(
        (piece) =>
          !isSamePiece(piece, move.captures) && !isSamePiece(piece, move.piece)
      )

      pieces.push({
        ...move.piece,
        square: move.to,
      })

      return {
        ...board,
        turn: getOppositeSide(board.turn),
        pieces,
        moves: [...board.moves, move],
      }
    }
    case 'castle': {
      const pieces = board.pieces.filter(
        (piece) =>
          !isSamePiece(piece, move.piece) &&
          !isSamePiece(piece, move.rook.piece)
      )

      pieces.push({
        ...move.piece,
        square: move.to,
      })

      pieces.push({
        ...move.rook.piece,
        square: move.rook.to,
      })

      return {
        ...board,
        turn: getOppositeSide(board.turn),
        pieces,
        moves: [...board.moves, move],
      }
    }
  }

  throw new Error('Unhandled move type')
}

export const isCheckForSide = (side: Side, board: Board): boolean => {
  const opposingPieces = board.pieces.filter((piece) => side !== piece.side)
  const king = getKingForSide(side, board)

  const boardAsOpposite = { ...board, turn: getOppositeSide(board.turn) }

  return opposingPieces
    .flatMap((piece) => getLegalMovesForPiece(piece, boardAsOpposite))
    .some((move): boolean => {
      switch (move.type) {
        case 'standard':
          return isSameSquare(move.to, king.square)
        case 'castle':
          return false
      }
    })
}

export const isCheckmateForSide = (side: Side, board: Board) =>
  isCheckForSide(side, board) &&
  board.pieces
    .filter((piece) => piece.side === side)
    .flatMap((piece) => getLegalMovesForPiece(piece, board)).length === 0

export const isStalemateForSide = (side: Side, board: Board) =>
  !isCheckmateForSide(side, board) &&
  board.pieces
    .filter((piece) => piece.side === side)
    .flatMap((piece) => getLegalMovesForPiece(piece, board)).length === 0

export const getLegalMovesForPiece = (piece: Piece, board: Board): Move[] => {
  let moves = PIECES[piece.name].moveset.flatMap((pattern) =>
    pattern(piece, board)
  )

  if (board.turn === piece.side) {
    moves = moves.filter(
      (move) => !isCheckForSide(board.turn, applyMove(move, board))
    )
  }

  return moves
}
