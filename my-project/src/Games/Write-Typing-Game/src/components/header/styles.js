import styled from "styled-components";

export const Header = styled.div`
  background-image: linear-gradient(#000000, transparent);
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;

  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;

    div {
      color: #efefef;
      border: 1.5px solid #1f1f1f;
      box-shadow: 1px 1px 0px 1px #1f1f1f;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      user-select: none;

      &:hover {
        scale: 1.2;
        background: #1f1f1f;
        margin: 0px 6px;
      }
    }
  }
`;
