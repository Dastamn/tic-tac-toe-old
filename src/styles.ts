import styled from "@emotion/styled";

export const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
`;

export const BoardHeader = styled.header`
  text-align: center;

  h1 {
    font-size: 2.5rem;
  }

  button {
    padding: 10px 15px;
    background-color: black;
    border-radius: 10px;
    border-width: 3px;
    border: 1.5px solid gray;
    color: gray;
    text-transform: capitalize;
    transition: all 0.2s ease;
  }

  button:hover {
    cursor: pointer;
    border-color: white;
    color: white;
  }

  button:focus {
    outline: 0;
  }

  h1,
  h2,
  button {
    margin-bottom: 20px;
  }
`;

export const BoardGrid = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
`;

export const BoardFooter = styled.footer`
  display: flex;
  font-weight: bold;
  justify-content: space-around;
  margin: 20px 0;
`;
