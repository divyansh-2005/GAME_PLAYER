import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const Image = styled.img`
  width: 100px;
  height: 100px;
  border: 1px solid #eaeaea;
  padding: 10px;
`

const Wheel = ({ image }) => <Image src={image} alt={image} data-testid='wheel' />

Wheel.propTypes = {
  image: PropTypes.string.isRequired
}

export default Wheel
