import { immutable } from 'kaiku'
import { Move } from '../common/gameRules'
import { ClientMessage, ServerMessage } from '../common/messages'
import { state } from './state'

const connection = new WebSocket(
  location.origin.replace(/^http/, 'ws'),
  'choss'
)

const sendMessage = (message: ClientMessage) => {
  connection.send(JSON.stringify(message))
}

export const createNewGame = () => {
  sendMessage({
    type: 'new-game',
    user: state.uuid,
  })
}

export const playMove = (move: Move) => {
  sendMessage({
    type: 'play-move',
    id: state.gameId!,
    user: state.uuid,
    move: move,
  })
}

export const joinGame = (id: string) => {
  sendMessage({
    type: 'join-game',
    id: id,
    user: state.uuid,
  })
}
connection.addEventListener('open', () => {
  if (state.gameId && !state.game) {
    joinGame(state.gameId)
  }
})

connection.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data) as ServerMessage
  console.log(message)

  switch (message.type) {
    case 'game-created': {
      state.gameId = message.id

      history.pushState({}, '', '/?g=' + message.id)

      joinGame(message.id)
      break
    }

    case 'game-update': {
      state.game = immutable(message.game)
      break
    }
  }
})
