import { h, immutable } from 'kaiku'
import {
  applyMove,
  getLegalMovesForPiece,
  getMoveTargetSquare,
  isCheckForSide,
  isCheckmateForSide,
  isSameSquare,
  isStalemateForSide,
  Move,
  Piece,
  Board,
  Square,
} from '../common/gameRules'
import * as connection from './connection'
import { getPlayerSide, isPlayersTurn, state } from './state'
import css from './Board.css'

type SquareProps = {
  square: Square
  move?: Move
}

const Square = ({ square, move }: SquareProps) => {
  const side = getPlayerSide()

  return (
    <div
      className={css('square', (square.x + square.y) % 2 ? 'light' : 'dark', {
        'legal-move': move,
      })}
      onClick={() => {
        if (move) {
          connection.playMove(move)
        }
        state.selectedPiece = null
      }}
    >
      <div className={css('legal-move-marker')} />
    </div>
  )
}

type PieceProps = {
  piece: Piece
  board: Board
}

const Piece = ({ piece, board }: PieceProps) => {
  const side = getPlayerSide()

  const offsetY =
    side === 'white'
      ? (board.height - 1) * 100 - piece.square.y * 100
      : piece.square.y * 100

  return (
    <div
      className={css('piece', {
        'is-movable': piece.side === board.turn,
      })}
      style={{
        transform: `translate(${piece.square.x * 100}px, ${offsetY}px)`,
        backgroundImage: `url(/assets/${piece.name}.svg)`,
        filter: piece.side === 'black' ? 'invert(1)' : 'none',
      }}
      onClick={() => {
        if (isPlayersTurn()) {
          state.selectedPiece = immutable(piece)
        }
      }}
    ></div>
  )
}

type BoardProps = {
  board: Board
}

const Board = ({ board }: BoardProps) => {
  const squares: Square[] = []
  const side = getPlayerSide()

  if (side === 'white') {
    for (let y = board.height - 1; y >= 0; y--)
      for (let x = 0; x < board.width; x++) {
        squares.push({ x, y })
      }
  } else {
    for (let y = 0; y < board.height; y++)
      for (let x = 0; x < board.width; x++) {
        squares.push({ x, y })
      }
  }

  const legalMoves = state.selectedPiece
    ? getLegalMovesForPiece(state.selectedPiece, board)
    : []

  return (
    <div>
      <p>
        You're playing as <b>{getPlayerSide()}.</b>
      </p>
      <p>{isPlayersTurn() ? "It's your turn!" : 'Oppents turn.'}</p>
      <p>Check: {isCheckForSide(board.turn, board).toString()}</p>
      <p>Checkmate: {isCheckmateForSide(board.turn, board).toString()}</p>
      <div
        className={css('board')}
        style={{
          width: `${board.width * 100}px`,
          height: `${board.height * 100}px`,
        }}
      >
        {squares.map((square) => (
          <Square
            square={square}
            move={legalMoves.find((move) =>
              isSameSquare(getMoveTargetSquare(move), square)
            )}
          />
        ))}
        {board.pieces.map((piece) => (
          <Piece piece={piece} board={board} />
        ))}
      </div>
    </div>
  )
}

export default Board
