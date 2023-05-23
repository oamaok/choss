import { h, render } from 'kaiku'
import Board from './Board'
import { state } from './state'
import * as connection from './connection'

const App = () => {
  const isInGame = state.gameId !== null
  const hasGameStarted = !!state.game?.white

  if (!isInGame) {
    return <button onClick={() => connection.createNewGame()}>New game</button>
  }

  if (!hasGameStarted) {
    return <span>Waiting for opponent to join</span>
  }

  return <Board board={state.game!.board} />
}

render(<App />, document.querySelector('#app')!)
