import * as S from "../styles";

const index = ({currentWord , setColor}) => {
  return (
    <S.Word>
    {
      currentWord ? currentWord.split("").map((letter, index) => (
        <div className="letter" key={index} style={{color: setColor(letter, index),}} >{letter}</div>
    )) : (
     <>
       <div className="letter"  >T</div>
      <div className="letter"  >Y</div>
      <div className="letter"  >P</div>
      <div className="letter"  >E</div>
     </>
    )
    
    }
  </S.Word>
  )
}

export default index