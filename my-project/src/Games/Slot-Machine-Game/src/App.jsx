import React from 'react'
import styled from 'styled-components'

import SlotMachine from './container/SlotMachine'

const Page = styled.div`
  width: 600px;
  margin: 10px auto;
  text-align: center;
`

const App = props => (
  <Page>
    <SlotMachine />
  </Page>
)

export default App
