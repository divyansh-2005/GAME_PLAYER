import Heart from "../../../assets/images/heart.svg";
import HeartEmpty from "../../../assets/images/heart-empty.svg";

import * as S from "../styles";

const index = ({ health }) => {
  return (
    <S.Health>
      {health === 0 ? (
        <>
          <img src={HeartEmpty} alt="heart-empty" />
          <img src={HeartEmpty} alt="heart-empty" />
          <img src={HeartEmpty} alt="heart-empty" />
        </>
      ) : health === 1 ? (
        <>
          <img src={Heart} alt="heart-full" />
          <img src={HeartEmpty} alt="heart-empty" />
          <img src={HeartEmpty} alt="heart-empty" />
        </>
      ) : health === 2 ? (
        <>
          <img src={Heart} alt="heart-full" />
          <img src={Heart} alt="heart-full" />
          <img src={HeartEmpty} alt="heart-empty" />
        </>
      ) : (
        <>
          <img src={Heart} alt="heart-full" />
          <img src={Heart} alt="heart-full" />
          <img src={Heart} alt="heart-full" />
        </>
      )}
    </S.Health>
  );
};

export default index;
