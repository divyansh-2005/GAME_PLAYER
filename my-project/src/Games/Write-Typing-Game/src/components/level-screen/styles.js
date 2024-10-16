import styled from "styled-components";

export const Level = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

export const LevelContent = styled.div`
  text-align: center;
  margin-top: 30px;
`;
export const LevelTitle = styled.div`
  font-size: 24px;
  color: #fff;
  text-transform: uppercase;
`;

export const LevelButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 38px;
  margin-top: 30px;

  .active {
    border: 1px solid #005b14;
    background: #00831d;
    box-shadow: 0px 3px 0px 1.5px #005b14;
    color: #fff;
  }
`;

export const LevelButton = styled.button`
  border-radius: 8px;
  border: 1px solid #1f1f1f;
  background: #000;
  box-shadow: 0px 1px 0px 1.5px #1f1f1f;
  color: #fff;
  font-size: 18px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #00831d;
  }

  &:active {
    border: 1px solid #005b14;
    background: #00831d;
    box-shadow: 0px 3px 0px 1.5px #005b14;
    color: #fff;
  }
`;
