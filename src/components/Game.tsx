import React, { Component } from "react";
import styled from "@emotion/styled";
import Cell from "./Cell";
import { arrayExpression } from "@babel/types";

interface State {
  winner: string | undefined;
  isX: boolean;
  step: number;
  x_history: string[][];
  o_history: string[][];
  current: string[];
  data: any;
}

const GridContainer = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
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

export default class Game extends Component {
  state: State = {
    winner: undefined,
    isX: Math.floor(Math.random() * 2) === 1,
    step: 0,
    x_history: [],
    o_history: [],
    current: new Array(9).fill("-"),
    data: {}
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
    const history = winner === "Player" ? [...x_history] : [o_history];
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i].join("");
      const next = history[i + 1].join("");
      if (!data[current]) {
        data[current] = {};
      }
      data[current][next] = ++data[current][next] || 1;
    }
    this.setState({ data });
  };

  toggleHandler = (index: number) => {
    console.log("toggle: " + index);
    const { state } = this;
    if (!state.winner) {
      const { checkWinner } = this;
      console.log(state.isX ? "player turn" : "computer turn");
      const x_history = [...state.x_history];
      const o_history = [...state.o_history];
      const current = [...state.current];
      if (state.isX) {
        x_history.push(state.current);
        current[index] = "X";
        x_history.push(current);
      } else {
        o_history.push(state.current);
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
        console.log(!isX ? "Player wins" : "Computer wins");
        this.setState({ winner: !isX ? "Player" : "Computer" });
        console.log("end game");
      }
    });
  };

  play = () => {
    const {
      state: { current, data },
      toggleHandler,
      checkWinner
    } = this;
    const obj = data[current.join("")];
    if (obj) {
      const next = Object.keys(obj)
        .sort((a, b) => obj[b] - obj[a])[0]
        .split("");
      for (let i = 0; i < next.length; i++) {
        if (current[i] !== next[i]) {
          toggleHandler(i);
          break;
        }
      }
      console.log("current: " + current, "next: ", next);
    } else {
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
    }
  };

  render() {
    const {
      state: { winner, isX, current },
      toggleHandler,
      play,
      resetGame
    } = this;

    if (!isX && !winner) {
      console.log("NO WINNER");
      setTimeout(() => play(), 500);
    }

    // console.log(this.state);

    return (
      <div>
        {winner ? (
          <h1>{winner} wins!</h1>
        ) : (
          <h1>{isX ? "Player turn" : "Computer turn"}</h1>
        )}
        <button onClick={resetGame}>New Game</button>
        <GridContainer>
          {current.map((value, index) => (
            <Cell
              key={index}
              index={index}
              value={value}
              isPlayer={isX}
              toggle={toggleHandler}
            />
          ))}
        </GridContainer>
      </div>
    );
  }
}
