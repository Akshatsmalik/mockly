import React from 'react'
import ChatApp from './Call2'
import ChatInterface from './Popchatui'
import Navbar from './navbar'

function Call() {
  return (
    <div>
        <div>
            <Navbar/>
            <ChatInterface/>
            <ChatApp/>
        </div>
    </div>
  )
}

export default Call