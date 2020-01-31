import React, { Component } from "react";
import styled from "@emotion/styled";
import Cell from "./Cell";
import model from "../model.json";

interface State {
  isPlayer: boolean;
  winner: string | undefined;
  isX: boolean;
  step: number;
  x_history: string[][];
  o_history: string[][];
  current: string[];
  data: { [key: string]: { [key: string]: number } };
  player_wins: number;
  computer_wins: number;
  stop: boolean;
  epsilon: number;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  margin: 20px 0;
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

// const gameBasics = {
//   "OO-------": { "OOO------": 1 },
//   "-OO------": { "OOO------": 1 },
//   "O-O------": { "OOO------": 1 },

//   "---OO----": { "---OOO---": 1 },
//   "----OO---": { "---OOO---": 1 },
//   "---O-O---": { "---OOO---": 1 },

//   "------OO-": { "------OOO": 1 },
//   "-------OO": { "------OOO": 1 },
//   "------O-O": { "------OOO": 1 },

//   "O--O-----": { "O--O--O--": 1 },
//   "---O--O--": { "O--O--O--": 1 },
//   "O-----O--": { "O--O--O--": 1 },

//   "-O--O----": { "-O--O--O-": 1 },
//   "----O--O-": { "-O--O--O-": 1 },
//   "-O-----O-": { "-O--O--O-": 1 },

//   "--O--O---": { "--O--O--O": 1 },
//   "-----O--O": { "--O--O--O": 1 },
//   "--O-----O": { "--O--O--O": 1 },

//   "O---O----": { "O---O---O": 1 },
//   "----O---O": { "O---O---O": 1 },
//   "O-------O": { "O---O---O": 1 },

//   "--O-O----": { "--O-O-O--": 1 },
//   "----O-O--": { "--O-O-O--": 1 },
//   "--O---O--": { "--O-O-O--": 1 }
// };

const lr = 0.9;
const data = model["data"];
const knowledge = data["moves"];

const spread = (max: number) => {
  const arr = [];
  const start = 0.2;
  const stop = 1;
  const step = (stop - start) / (max - 1);
  for (var i = 0; i < max; i++) {
    arr.push(Number((start + step * i).toFixed(2)));
  }
  return arr;
};

/** */

export default class Game extends Component {
  state: State = {
    isPlayer: Math.floor(Math.random() * 2) === 1,
    stop: false,
    winner: undefined,
    isX: Math.floor(Math.random() * 2) === 1,
    step: 0,
    x_history: [],
    o_history: [],
    current: new Array(9).fill("-"),
    data: knowledge,
    player_wins: 0,
    computer_wins: 0,
    epsilon: 0.7
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
      // epsilon:
      //   this.state.epsilon > 0 ? this.state.epsilon - 0.01 : this.state.epsilon
    });
  };

  updateData = () => {
    const {
      state: { winner, x_history, o_history, data, computer_wins, player_wins }
    } = this;
    if (winner) {
      const posReward =
        winner === "Player"
          ? x_history.map(array =>
              array.map(value =>
                value === "X" ? "O" : value === "O" ? "X" : "-"
              )
            )
          : [...o_history];
      const negReward =
        winner === "Player"
          ? [...o_history]
          : x_history.map(array =>
              array.map(value =>
                value === "X" ? "O" : value === "O" ? "X" : "-"
              )
            );
      let i = posReward.length - 2;
      let discountArray = spread(posReward.length - 1);
      while (i >= 0) {
        const curr = posReward[i].join("");
        const next = posReward[i + 1].join("");
        let maxNext = 0;
        if (data[next] !== undefined) {
          const key = Object.keys(data[next]).sort(
            (a, b) => data[next][b] - data[next][a]
          )[0];
          maxNext = data[next][key] || 0;
        }
        let stateValue = 0;
        if (data[curr] !== undefined) {
          stateValue = data[curr][next] || 0;
        }
        const discount = discountArray.pop() || 0.1;
        const reward = (1 - lr) * stateValue + lr * discount * (1 + maxNext);
        if (data[curr] === undefined) {
          data[curr] = {};
        }
        data[curr][next] = Number(reward.toFixed(2));
        i = i - 2;
      }
      i = negReward.length - 2;
      discountArray = spread(negReward.length - 1);
      while (i >= 0) {
        const curr = negReward[i].join("");
        const next = negReward[i + 1].join("");
        let maxNext = 0;
        if (data[next] !== undefined) {
          const key = Object.keys(data[next]).sort(
            (a, b) => data[next][b] - data[next][a]
          )[0];
          maxNext = data[next][key] || 0;
        }
        let stateValue = 0;
        if (data[curr] !== undefined) {
          stateValue = data[curr][next] || 0;
        }
        const discount = discountArray.pop() || 0.1;
        const reward = (1 - lr) * stateValue + lr * discount * (-1 + maxNext);
        if (data[curr] === undefined) {
          data[curr] = {};
        }
        data[curr][next] = Number(reward.toFixed(2));
        i = i - 2;
      }
      this.setState(
        {
          data
        },
        () => console.log(this.state)
      );
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
        x_history.push(state.current);
        x_history.push(current);
      } else {
        current[index] = "O";
        o_history.push(state.current);
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
      // console.log(this.state);
    }
  };

  whoWon = (board?: string[]) => {
    let current = board ? board : this.state.current;
    for (let win of wins) {
      const [a, b, c] = win;
      if (
        (current[a] === "X" || current[a] === "O") &&
        current[a] === current[b] &&
        current[b] === current[c]
      ) {
        return current[a] === "O" ? -10 : 10;
      }
    }
    return current.find(value => value === "-") ? undefined : 0;
  };

  checkWinner = () => {
    const {
      state: { current, isX }
    } = this;
    console.log("who won:", this.whoWon());
    wins.forEach(win => {
      const [a, b, c] = win;
      if (
        (current[a] === "X" || current[a] === "O") &&
        current[a] === current[b] &&
        current[b] === current[c]
      ) {
        if (!isX) {
          this.setState(
            {
              winner: "Player",
              player_wins: this.state.player_wins + 1
            },
            () => this.resetGame()
          );
        } else {
          this.setState(
            {
              winner: "Computer",
              computer_wins: this.state.computer_wins + 1
            },
            () => this.resetGame()
          );
        }
      }
    });
  };

  play = async () => {
    const {
      state: { data },
      toggleHandler,
      playRandomly
    } = this;
    const poss = data[this.state.current.join("")];
    if (poss) {
      const nextMove = Object.keys(poss)
        .sort((a, b) => poss[b] - poss[a])[0]
        .split("");
      for (let i = 0; i < nextMove.length; i++) {
        if (this.state.current[i] !== nextMove[i]) {
          await sleep(500).then(() => toggleHandler(i));
          break;
        }
      }
    } else {
      playRandomly();
    }
  };

  playRandomly = () => {
    const {
      state: { current, winner },
      toggleHandler,
      checkWinner
    } = this;
    if (!winner) {
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

  playMiniMax = () => {
    const {
      state: { current, winner },
      miniMax,
      toggleHandler
    } = this;
    if (!winner) {
      const move = miniMax([...current], true);
      console.log("next move", move);
      toggleHandler(move.index);
    }
  };

  saveData = () => {
    const {
      state: { data }
    } = this;
    fetch("http://localhost:3001/data", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moves: data
      })
    }).catch(err => console.log(err));
  };

  miniMax = (board: string[], isMax: boolean) => {
    const score = this.whoWon(board);
    if (score !== undefined) {
      return { score, index: 0 };
    }
    const moves: { score: number; index: number }[] = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "-") {
        const move: any = {};
        move.index = i;
        board[i] = !isMax ? "O" : "X";
        const result = this.miniMax(board, !isMax);
        move.score = result.score;
        board[i] = "-";
        moves.push(move);
      }
    }
    let bestMove;
    if (isMax) {
      let bestScore = -10;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      var bestScore = 10;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove || 0];
  };

  render() {
    const {
      state: { stop, winner, isX, current, step, player_wins, computer_wins },
      toggleHandler,
      play,
      resetGame
    } = this;

    // if (!stop) {
    //   if (isX) {
    //     this.playMiniMax();
    //   } else {
    //     if (Math.random() <= this.state.epsilon) {
    //       console.log("explore, epsilon: " + this.state.epsilon);
    //       this.playRandomly();
    //     } else {
    //       console.log("exploit");
    //       play();
    //     }
    //   }
    //   if (step === 9) {
    //     resetGame();
    //   }
    // }

    if (!isX && !winner) {
      setTimeout(() => this.playMiniMax(), 500);
    }

    return (
      <Container>
        <Header>
          <h1>Tic Tac Toe</h1>
          <h2>
            {winner
              ? `${winner} won in ${step} steps!`
              : step === 9
              ? "Tie!"
              : isX
              ? "It's your turn!"
              : "Computer turn..."}
          </h2>
          <button
            style={winner ? { color: "white", borderColor: "white" } : {}}
            onClick={resetGame}
          >
            {winner ? "Try again!" : "New Game"}
          </button>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              this.setState({ stop: true });
              console.log(this.state.data);
              this.saveData();
            }}
          >
            Stop
          </button>
          <button style={{ marginLeft: "10px" }} onClick={this.saveData}>
            Save
          </button>
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
