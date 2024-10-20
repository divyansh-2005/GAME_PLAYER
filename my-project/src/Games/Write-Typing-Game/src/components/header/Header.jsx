import * as S from "./styles";

const Header = () => {
  const logo = "writé";
  return (
    <S.Header>
      <div className="logo">
        {logo.split("").map((letter, index) => (
          <div key={index}>{letter}</div>
        ))}
      </div>
    </S.Header>
  );
};

export default Header;
