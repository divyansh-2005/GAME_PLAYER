import React from 'react'
import PropTypes from 'prop-types'

import Wheel from '../components/Wheel'

import strawberry from '../assets/img/strawberry.png'
import banana from '../assets/img/banana.png'
import orange from '../assets/img/orange.png'
import monkey from '../assets/img/monkey.png'

class Spinner extends React.Component {

  static propTypes = {
    spin: PropTypes.bool.isRequired,
    onStop: PropTypes.func.isRequired
  }

  state = {
    spinning: false,
    wheels: [],
  }

  images = [strawberry, banana, orange, monkey]

  componentDidMount() {
    this.setState({
      wheels: [
        this.randomImage(),
        this.randomImage(),
        this.randomImage()
      ]}
    )
  }

  static getDerivedStateFromProps(props, state) {
    return { spinning: props.spin }
  }

  componentDidUpdate(prevProps, prevState) {
    const { spinning } = this.state

    if (spinning && (spinning !== prevState.spinning)) {
      this.tick()
    }

    if (!spinning && (spinning !== prevState.spinning)) {
      clearInterval(this.isSpinning)
      this.props.onStop(this.state.wheels)
    }
  }

  randomImage = () => this.images[Math.floor((Math.random() * this.images.length))]

  spin = () => this.setState({
    wheels: [
      this.randomImage(),
      this.randomImage(),
      this.randomImage()
    ]
  })

  tick = () => this.isSpinning = setInterval(this.spin, 50)

  render() {
    const { wheels } = this.state

    return (
      <React.Fragment>
      <div style={{display:"flex",justifyContent:"center", margin:"45px 0"}}>

        {wheels.map((wheel, id) => (
          <Wheel key={`${id}_${wheel}`} image={wheel} />)
        )}
      </div>
      </React.Fragment>
    )
  }
}

export default Spinner
