import React, { useEffect, useRef, useState } from 'react'
import data from './data'
import GameMessage from './GameMessage'
import { addRow, displayRow, restartGame, handleGameUserInput } from './GameLogic'
import audio1 from '../../assets/songs/1.mp3'
import audio2 from '../../assets/songs/2.mp3'
import audio3 from '../../assets/songs/3.mp3'
import audio4 from '../../assets/songs/4.mp3'
import muteImage from '../../assets/images/mute.png'
import unmuteImage from '../../assets/images/unmute.png'
import Header from '../../Components/Header'
import Footer from '../../Components/Footer'

const PianoTiles = () => {
   const [score, setScore] = useState(0)
   const [showWelcomeMessage, setShowWelcomeMessage] = useState(true)
   const [isGameOver, setIsGameOver] = useState(false)
   const [isGameStarted, setIsGameStarted] = useState(false)
   const [isMuted, setIsMuted] = useState(false)
   const audioFiles = [audio1, audio2, audio3, audio4]

   const canvasRef = useRef(null)
   const audioRef = useRef(null)
   const { config, tileRows } = data
   let requestId

   const initGame = () => {
      const { current: canvas } = canvasRef
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, config.width, config.height)
      tileRows.length = 0

      Array.from({ length: config.rows }, () => addRow(canvas, stopGameLoop))

      Array.from({ length: Math.ceil(600 / config.speed) }, () =>
         tileRows.forEach((row) => row.decrement())
      )

      tileRows.forEach((row) => displayRow(ctx, row))
   }

   const stopGameLoop = (canvas) => {
      setIsGameStarted(false)
      setIsGameOver(true)
      canvas.removeEventListener('click', clickHandler)
   }

   const renderGame = () => {
      const { current: canvas } = canvasRef
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, config.width, config.height)

      for (let i = 0; i < tileRows.length; i++) {
         displayRow(ctx, tileRows[i])
      }

      requestId = requestAnimationFrame(renderGame)
   }

   const clickHandler = (event) => {
      const { current: canvas } = canvasRef

      handleGameUserInput(event, canvas, setScore, isGameStarted, setIsGameStarted, stopGameLoop)
   }

   const setupGameEventListeners = () => {
      const { current: canvas } = canvasRef
      if (!(showWelcomeMessage || isGameOver)) {
         canvas.addEventListener('click', clickHandler)
      }
   }

   useEffect(() => {
      const { current: canvas } = canvasRef
      const ctx = canvas.getContext('2d')

      ctx.lineWidth = 1
      ctx.strokeStyle = '#116D6E'

      !isGameOver && initGame()
   }, [isGameOver])

   useEffect(() => {
      setupGameEventListeners()
      isGameStarted && renderGame(canvasRef, requestId)

      return () => {
         const { current: canvas } = canvasRef
         canvas.removeEventListener('click', clickHandler)
         cancelAnimationFrame(requestId)
      }
   }, [showWelcomeMessage, isGameStarted, isGameOver])

   useEffect(() => {
      const audio = audioRef.current
      if (audio && isGameStarted) {
         audio.src = audioFiles[Math.floor(Math.random() * audioFiles.length)]
         audio.loop = true
         audio.play().catch((error) => console.error('Audio playback error:', error))
      }
      return () => {
         if (audio) audio.pause()
      }
   }, [isGameStarted])

   const toggleMute = () => {
      const audio = audioRef.current
      if (audio) {
         audio.muted = !audio.muted
         setIsMuted(!isMuted)
      }
   }

   return (
    <>
    <Header/>

        < div className='bg-white  '>
      
        <div className="flex  items-center  gap-4">
            <button
                onClick={toggleMute}
                className=" "
            >
                <img
                    src={isMuted ? muteImage : unmuteImage}
                    alt={isMuted ? 'Mute' : 'Unmute'}
                    width={50}
                    height={30}
                />
            </button>
            
            <div className="flex flex-col font-bold text-3xl text-white  py-2 rounded-lg shadow-lg  items-center">
               <h1 className=" text-2xl block  mb-2 rounded-lg py-1 px-2">
                  Score
               </h1>
               <div className="text-yellow-400 text-4xl">{score}</div>
            </div>

        </div>

        <div className="flex justify-center items-center h-screen">
  <canvas
    id="gameCanvas"
    className="relative border-[0.5px] border-gray-300"
    ref={canvasRef}
    width={data.config.width}
    height={data.config.height}
  ></canvas>
</div>

         {(showWelcomeMessage || isGameOver) && (
            <h1 className="sm:text-4xl bg-cyan-900 text-3xl block [text-shadow:_-1px_-1px_0_#fff] absolute top-1/4 transform -translate-y-1/2 left-0 w-full">
               Piano Tiles Game
            </h1>
         )}
         {showWelcomeMessage && (
            <GameMessage
               message="Let's Start Tapping"
               buttonLabel="Start Playing"
               onClick={() =>
                  restartGame(setShowWelcomeMessage, setScore, setIsGameStarted, setIsGameOver)
               }
            />
         )}
         {isGameOver && (
            <GameMessage
               message="Opps! Wrong Tile"
               buttonLabel="Restart Game"
               onClick={() =>
                  restartGame(setShowWelcomeMessage, setScore, setIsGameStarted, setIsGameOver)
               }
            />
         )}
         <audio
            ref={audioRef}
            loop
         />

        
      </div>
    <Footer></Footer>
    
    </>
      
   )
}

export default PianoTiles
