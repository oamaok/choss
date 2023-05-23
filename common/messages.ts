import { Board, Move } from './gameRules'

export type NewGameMessage = {
  type: 'new-game'
  user: string
}

export type GameJoinMessage = {
  type: 'join-game'
  id: string
  user: string
}

export type PlayMoveMessage = {
  type: 'play-move'
  id: string
  user: string
  move: Move
}

export type ClientMessage = NewGameMessage | GameJoinMessage | PlayMoveMessage

export type Game = {
  id: string
  creator: string
  board: Board
  white: string | null
  black: string | null
}

export type GameCreatedMessage = {
  type: 'game-created'
  id: string
}

export type GameUpdateMessage = {
  type: 'game-update'
  game: Game
}

export type ServerMessage = GameCreatedMessage | GameUpdateMessage
