import styled from 'styled-components';

export const Content = styled.div`
    
`;

export const WordBox = styled.div`
    position: absolute;
    top: 6%;
    left: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    margin: 0px 16px;
    background: #1F1F1F;
    width: max-content;
    padding: 8px 16px;
    border-radius: 8px;
    text-transform: uppercase;
    color: rgba(239, 239, 239, 0.2);
    font-size: 20px;
    font-weight: 600;
    transition: all 0.2s linear;

    .letter-box .letter {
        transition: all 0.2s linear;
        user-select: none;
    }
`;
