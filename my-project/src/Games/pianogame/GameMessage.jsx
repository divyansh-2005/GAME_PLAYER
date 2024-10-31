import React from 'react'

const GameMessage = ({ message, buttonLabel, onClick }) => (
   <div className="absolute top-1/3 text-center transform -translate-y-1/2 left-0 w-full">
      <h2 className="text-4xl text-center mt-6 text-red-400 block mt-20 [text-shadow:_-1px_-1px_0_#fff]">{message}</h2>
      <button
         className="border  border-gray-400 bg-white text-gray-800 font-bold text-xl text-base py-3 px-6 mt-2 rounded-full cursor-pointer [font-family:revert]"
         onClick={onClick}
      >
         {buttonLabel}
      </button>
   </div>
)

export default GameMessage
