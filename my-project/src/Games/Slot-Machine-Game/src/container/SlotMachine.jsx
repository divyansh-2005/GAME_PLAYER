import React from 'react'
import styled from 'styled-components'
import uniq from 'lodash/uniq'

import Spinner from './Spinner'
import Sound from '../components/Sound'

const Title = styled.h1`
  all:revert;
  font-size: 35px;
`

const Buttons = styled.div`
  margin: 10px auto;
`

const Button = styled.button`
  font-size: 20px;
  margin: 0 10px;
  padding: 10px;
`

const Winner = styled.div`
  margin: 20px auto;
  font-size: 25px;
  color: green;
`

const Loser = styled.div`
margin: 20px auto;
font-size: 25px;
color: red;
`

const MAX_PRIZE = 100
const CONSEC_PRIZE = 20
const NON_CONSEC_PRIZE = 10

class SlotMachine extends React.Component {

  state = {
    isRunning: false,
    winner: false,
    prize: 0,
  }

  componentDidMount() {
    this.start = setTimeout(() => {
      this.handleStart()
    }, 5000)
  }

  componentDidUpdate() {
    if (this.state.isRunning) {
      this.stop = setTimeout(() => {
        this.handleStop()
      }, 10000)
    }
  }

  handleStart = () => {
    this.setState({
      isRunning: true,
      winner: false,
      lose: false,
      prize: 0
    })
    clearTimeout(this.start)
  }

  handleStop = () => {
    this.setState({ isRunning: false })
    clearTimeout(this.stop)
  }

  handleResult = (wheels) => {
    const images = wheels.map(wheel => wheel.split('/').pop())
    const result = uniq(images)

    // Loose.
    if (result.length === 3) {
      this.setState({ winner: false, lose: true, prize: 0 })
      return
    }

    // Win max prize.
    if (result.length === 1) {
      this.setState({ winner: true, lose: false, prize: MAX_PRIZE })
      return
    }

    // Two consecutive symbols.
    if (images[0] === images[1] || images[1] === images[2]) {
      this.setState({ winner: true, lose: false, prize: CONSEC_PRIZE })
      return
    }

    // Non-consecutive symbols.
    this.setState({ winner: true, lose: false, prize: NON_CONSEC_PRIZE })

  }

  render() {
    const { isRunning, winner, lose, prize } = this.state

    return (
      <React.Fragment>
        <Title>React Slot Machine</Title>
        <Spinner spin={isRunning} onStop={this.handleResult} />
        <Buttons>
          <Button onClick={this.handleStart} disabled={isRunning}>Start</Button>
          <Button onClick={this.handleStop} disabled={!isRunning}>Stop</Button>
        </Buttons>
        <div data-testid='prize'>
          {winner && <Winner>You win! Your prize: ${prize}.00</Winner>}
          {(winner && prize === MAX_PRIZE) && <Sound audio='win' />}
          {lose &&
            <React.Fragment>
              <Loser>You lose</Loser>
              <Sound audio='fail' />
            </React.Fragment>
          }
        </div>
      </React.Fragment>
    )
  }
}

export default SlotMachine
