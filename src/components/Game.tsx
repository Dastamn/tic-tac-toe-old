import React, { Component } from "react";
import styled from "@emotion/styled";
import Cell from "./Cell";

interface State {
  winner: string | undefined;
  isX: boolean;
  step: number;
  x_history: string[][];
  o_history: string[][];
  current: string[];
  data: { [key: string]: { [key: string]: number } };
  player_wins: number;
  computer_wins: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const Header = styled.header`
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

const GridContainer = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
`;

const Footer = styled.footer`
  display: flex;
  font-weight: bold;
  justify-content: space-around;
  margin-top: 20px;
`;

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const gameBasics = {
  "OO-------": { "OOO------": 10 },
  "-OO------": { "OOO------": 10 },
  "O-O------": { "OOO------": 10 },

  "---OO----": { "---OOO---": 10 },
  "----OO---": { "---OOO---": 10 },
  "---O-O---": { "---OOO---": 10 },

  "------OO-": { "------OOO": 10 },
  "-------OO": { "------OOO": 10 },
  "------O-O": { "------OOO": 10 },

  "O--O-----": { "O--O--O--": 10 },
  "---O--O--": { "O--O--O--": 10 },
  "O-----O--": { "O--O--O--": 10 },

  "-O--O----": { "-O--O--O-": 10 },
  "----O--O-": { "-O--O--O-": 10 },
  "-O-----O-": { "-O--O--O-": 10 },

  "--O--O---": { "--O--O--O": 10 },
  "-----O--O": { "--O--O--O": 10 },
  "--O-----O": { "--O--O--O": 10 },

  "O---O----": { "O---O---O": 10 },
  "----O---O": { "O---O---O": 10 },
  "O-------O": { "O---O---O": 10 },

  "--O-O----": { "--O-O-O--": 10 },
  "----O-O--": { "--O-O-O--": 10 },
  "--O---O--": { "--O-O-O--": 10 }
};

export default class Game extends Component {
  state: State = {
    winner: undefined,
    isX: Math.floor(Math.random() * 2) === 1,
    step: 0,
    x_history: [],
    o_history: [],
    current: new Array(9).fill("-"),
    data: gameBasics,
    player_wins: 0,
    computer_wins: 0
  };

  resetGame = () => {
    this.updateData();
    this.setState({
      winner: undefined,
      isX: Math.floor(Math.random() * 2) === 1,
      step: 0,
      x_history: [],
      o_history: [],
      current: new Array(9).fill("-")
    });
  };

  updateData = () => {
    const {
      state: { winner, x_history, o_history, data }
    } = this;
    if (winner) {
      const history =
        winner === "Player"
          ? [...x_history].map(array =>
              array.map(value => (value === "X" ? "O" : "-"))
            )
          : [...o_history].map(array =>
              array.map(value => (value === "O" ? "O" : "-"))
            );
      for (let i = 0; i < history.length - 1; i++) {
        const current = history[i].join("");
        const next = history[i + 1].join("");
        if (!data[current]) {
          data[current] = {};
        }
        data[current][next] = ++data[current][next] || 1;
      }
      this.setState({ data });
    }
  };

  toggleHandler = (index: number) => {
    const { state } = this;
    if (!state.winner) {
      const { checkWinner } = this;
      const x_history = [...state.x_history];
      const o_history = [...state.o_history];
      const current = [...state.current];
      if (state.isX) {
        current[index] = "X";
        x_history.push(current);
      } else {
        current[index] = "O";
        o_history.push(current);
      }
      this.setState(
        {
          isX: !this.state.isX,
          step: state.step + 1,
          x_history,
          o_history,
          current
        },
        () => checkWinner()
      );
    }
  };

  checkWinner = () => {
    const {
      state: { current, isX }
    } = this;
    wins.forEach(win => {
      const [a, b, c] = win;
      if (
        (current[a] === "X" || current[a] === "O") &&
        current[a] === current[b] &&
        current[b] === current[c]
      ) {
        if (!isX) {
          this.setState({
            winner: "Player",
            player_wins: this.state.player_wins + 1
          });
        } else {
          this.setState({
            winner: "Computer",
            computer_wins: this.state.computer_wins + 1
          });
        }
      }
    });
  };

  play = () => {
    const {
      state: { current, data },
      toggleHandler,
      playRandomly
    } = this;
    const playerCurrent = current
      .map(value => (value === "X" ? "O" : value === "O" ? "-" : "-"))
      .join("");
    const computerCurrent = current
      .map(value => (value === "O" ? "O" : "-"))
      .join("");
    const objP = data[playerCurrent];
    const objC = data[computerCurrent];
    let possMove: string;
    let nextMove: [string, number] | undefined;
    if (objP) {
      possMove = Object.keys(objP).sort((a, b) => objP[b] - objP[a])[0];
      nextMove = [possMove, objP[possMove]];
    }
    if (objC) {
      possMove = Object.keys(objC).sort((a, b) => objC[b] - objC[a])[0];
      if (!nextMove || nextMove[1] <= objC[possMove]) {
        nextMove = [possMove, objC[possMove]];
      }
    }
    if (nextMove) {
      const array = nextMove[0].split("");
      let i = 0;
      while (i < array.length) {
        if (current[i] === "-" && current[i] !== array[i]) {
          toggleHandler(i);
          break;
        }
        i++;
      }
      if (i >= array.length) {
        playRandomly();
      }
    } else {
      playRandomly();
    }
  };

  playRandomly = () => {
    const {
      state: { current },
      toggleHandler,
      checkWinner
    } = this;
    const indexArray = current
      .map((value, index) => (value === "-" ? index : undefined))
      .filter(value => value !== undefined);
    const randomMove =
      indexArray[Math.floor(Math.random() * indexArray.length)];
    if (randomMove !== undefined) {
      toggleHandler(randomMove);
    } else {
      checkWinner();
    }
  };

  render() {
    const {
      state: { winner, isX, current, step, player_wins, computer_wins },
      toggleHandler,
      play,
      resetGame
    } = this;

    if (!isX && !winner) {
      setTimeout(() => play(), 500);
    }

    return (
      <Container>
        <Header>
          <h1>Tic Tac Toe</h1>
          <h2>
            {winner
              ? `${winner} won is ${step} steps!`
              : step === 9
              ? "Tie!"
              : isX
              ? "It's your turn!"
              : "Computer turn..."}
          </h2>
          <button onClick={resetGame}>New Game</button>
        </Header>
        <GridContainer>
          {current.map((value, index) => (
            <Cell
              key={index}
              index={index}
              value={value}
              winner={winner !== undefined}
              isPlayer={isX}
              toggle={toggleHandler}
            />
          ))}
        </GridContainer>
        <Footer>
          <span>Player: {player_wins}</span>
          <span>Computer: {computer_wins}</span>
        </Footer>
      </Container>
    );
  }
}
