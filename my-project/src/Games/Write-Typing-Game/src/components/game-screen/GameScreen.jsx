import React from 'react'
import Header from '../header/Header'
import Word from '../content/word/Word'
import Bottom from '../bottom/Bottom'


const GameScreen = ({
    words,
    setWords,
    typingWord,
    setTypingWord,
    matchedWord,
    setMatchedWord,
    health,
    setHealth,
    score,
    setScore,
    currentWord,
    setCurrentWord,
    level,
    setLevel,
    setCurrentState,
}) => {

  return (
    <div className="game">
    <Header />
    <div className="content">
      {words.map((word, index) => word !== '+' &&(
        <Word
        key={index} 
        word={word} 
        words={words} 
        setWords={setWords} 
        typingWord={typingWord} 
        setTypingWord={setTypingWord} 
        matchedWord={matchedWord} 
        setMatchedWord={setMatchedWord} 
        health={health}
        setHealth={setHealth}
        score={score}
        setScore={setScore}
        level={level}
        />
      ))}
    </div>
    <Bottom currentWord={currentWord} setCurrentState={setCurrentState} setLevel={setLevel} typingWord={typingWord} setCurrentWord={setCurrentWord} health={health} />
  </div>
  )
}

export default GameScreen