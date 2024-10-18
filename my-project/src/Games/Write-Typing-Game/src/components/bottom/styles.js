import styled from "styled-components";

export const Bottom = styled.div`
  background-image: linear-gradient(to bottom right, transparent, black);
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  z-index: 1;
`;

export const Health = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .healt__item {
  }
`;

export const Word = styled.div`
  background: #000000;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(239, 239, 239, 0.2);
  padding: 8px 16px;
  text-transform: uppercase;
  font-size: 24px;
  width: 275px;
  text-align: center;
  justify-content: center;

  .letter {
  }
`;

export const Restart = styled.div`
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease-in-out;

  &:hover {
    border: 1px solid #1f1f1f;
    rotate: -90deg;
    border-radius: 50%;
  }
`;
