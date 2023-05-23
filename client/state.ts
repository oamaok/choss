import { createState, immutable } from 'kaiku'
import { DEFAULT_CHESS } from '../common/boardSetups'
import { Board, Piece } from '../common/gameRules'
import { Game } from '../common/messages'

type AppState = {
  uuid: string
  gameId: string | null
  game: Game | null
  selectedPiece: Piece | null
}

const UUID_KEY = 'choss-uuid'
const uuid = localStorage.getItem(UUID_KEY) ?? crypto.randomUUID()
localStorage.setItem(UUID_KEY, uuid)

const gameId =
  new URLSearchParams(location.search.substring(1)).get('g') ?? null

export const state = createState<AppState>({
  uuid,
  gameId,
  game: null,
  selectedPiece: null,
})

export const getPlayerSide = () => {
  const game = state.game
  if (!game) {
    throw new Error('Game not in progress')
  }

  return game.white === state.uuid ? 'white' : 'black'
}

export const isPlayersTurn = () => {
  const game = state.game
  if (!game) {
    throw new Error('Game not in progress')
  }

  return game.board.turn === getPlayerSide()
}
