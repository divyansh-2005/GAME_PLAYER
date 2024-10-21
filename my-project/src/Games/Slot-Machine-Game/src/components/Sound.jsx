import React from 'react'
import PropTypes from 'prop-types'

import win from '../assets/audio/win.wav'
import fail from '../assets/audio/fail.wav'
import coin from '../assets/audio/coin.wav'

const audios = { win, fail, coin }

const Sound = ({ audio }) => (
  <audio autoPlay="autoplay" preload="false">
    <source src={audios[audio]} />
  </audio>
)

Sound.propTypes = {
  audio: PropTypes.string.isRequired
}

export default Sound
