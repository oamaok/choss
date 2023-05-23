import { Board } from './gameRules'

export const DEFAULT_CHESS: Board = {
  width: 8,
  height: 8,
  pieces: [
    {
      name: 'pawn',
      square: { x: 0, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 1, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 2, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 3, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 4, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 5, y: 1 },
      side: 'white',
    },
    {
      name: 'rook',
      square: { x: 0, y: 0 },
      side: 'white',
    },
    {
      name: 'rook',
      square: { x: 7, y: 0 },
      side: 'white',
    },
    {
      name: 'knight',
      square: { x: 6, y: 0 },
      side: 'white',
    },
    {
      name: 'knight',
      square: { x: 1, y: 0 },
      side: 'white',
    },
    {
      name: 'bishop',
      square: { x: 5, y: 0 },
      side: 'white',
    },
    {
      name: 'bishop',
      square: { x: 2, y: 0 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 6, y: 1 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 7, y: 1 },
      side: 'white',
    },
    {
      name: 'king',
      square: { x: 4, y: 0 },
      side: 'white',
    },
    {
      name: 'queen',
      square: { x: 3, y: 0 },
      side: 'white',
    },
    {
      name: 'pawn',
      square: { x: 0, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 1, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 2, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 3, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 4, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 5, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 6, y: 6 },
      side: 'black',
    },
    {
      name: 'pawn',
      square: { x: 7, y: 6 },
      side: 'black',
    },
    {
      name: 'rook',
      square: { x: 0, y: 7 },
      side: 'black',
    },
    {
      name: 'rook',
      square: { x: 7, y: 7 },
      side: 'black',
    },
    {
      name: 'knight',
      square: { x: 6, y: 7 },
      side: 'black',
    },
    {
      name: 'knight',
      square: { x: 1, y: 7 },
      side: 'black',
    },
    {
      name: 'bishop',
      square: { x: 5, y: 7 },
      side: 'black',
    },
    {
      name: 'bishop',
      square: { x: 2, y: 7 },
      side: 'black',
    },
    {
      name: 'king',
      square: { x: 4, y: 7 },
      side: 'black',
    },
    {
      name: 'queen',
      square: { x: 3, y: 7 },
      side: 'black',
    },
  ],
  turn: 'white',
  moves: [],
}
