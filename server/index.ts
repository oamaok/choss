import dotenv from 'dotenv'
dotenv.config()

import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import mount from 'koa-mount'
import bodyparser from 'koa-bodyparser'
import crypto from 'crypto'
import { connection as Connection, server as WebSocketServer } from 'websocket'
import fs from 'fs'
import { ClientMessage, Game, ServerMessage } from '../common/messages'
import { applyMove, isValidMove } from '../common/gameRules'
import { DEFAULT_CHESS } from '../common/boardSetups'

type KoaContext = Koa.DefaultContext
const app = new Koa<Koa.DefaultState, KoaContext>()
const apiRouter = new Router<any, KoaContext>()

app
  .use(bodyparser())
  .use(mount('/api', apiRouter.middleware()))
  .use(mount('/', serve('./dist')))
  .use((ctx) => {
    ctx.response.set('content-type', 'text/html')
    ctx.body = fs.createReadStream('./dist/index.html')
  })

const server = app.listen(8080)
const ws = new WebSocketServer({ httpServer: server })

const games: Record<string, Game> = {}
const gameConnections: Record<string, Connection[]> = {}

const sendMessage = (connection: Connection, message: ServerMessage) => {
  connection.send(JSON.stringify(message))
}

ws.on('request', (request) => {
  const connection = request.accept('choss', request.origin)

  connection.on('message', (data) => {
    if (data.type !== 'utf8') return

    try {
      const message: ClientMessage = JSON.parse(data.utf8Data)
      console.log(message)
      switch (message.type) {
        case 'new-game': {
          const gameId = crypto.randomUUID()

          const game = {
            id: gameId,
            creator: message.user,
            board: DEFAULT_CHESS,
            white: null,
            black: null,
          }

          games[game.id] = game

          sendMessage(connection, {
            type: 'game-created',
            id: game.id,
          })
          break
        }

        case 'join-game': {
          const game = games[message.id]

          if (!game) {
            // TODO: Handle invalid joins
            break
          }

          const connections = gameConnections[game.id] ?? []
          gameConnections[game.id] = connections
          connections.push(connection)

          if (!game.black && message.user !== game.creator) {
            const [white, black] =
              Math.random() < 0.5
                ? [game.creator, message.user]
                : [message.user, game.creator]
            game.white = white
            game.black = black
          }

          for (const conn of connections) {
            sendMessage(conn, {
              type: 'game-update',
              game,
            })
          }
          break
        }

        case 'play-move': {
          const game = games[message.id]

          if (!game) {
            // TODO: Handle invalid joins
            break
          }

          const connections = gameConnections[game.id]

          if (!connections) {
            // TODO: Handle games with no connections, should probably just not happen?
            break
          }

          if (!isValidMove(message.move, game.board)) {
            // TODO: More handling for invalid moves?
            break
          }

          game.board = applyMove(message.move, game.board)

          for (const conn of connections) {
            sendMessage(conn, {
              type: 'game-update',
              game,
            })
          }
        }
      }
    } catch (err) {
      console.error(err)
    }
  })
})
