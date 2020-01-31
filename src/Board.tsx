import React, { Component } from "react";
import Square from "./Square";
import { BoardContainer, BoardGrid, BoardHeader, BoardFooter } from "./styles";

interface Dict {
  [key: string]: {
    [key: string]: number;
  };
}

interface State {
  isPlayer: boolean;
  isX: boolean;
  gameIsFinished: boolean;
  board: string[];
  xHistory: string[][];
  yHistory: string[][];
  steps: number;
  knowledge: Dict;
}

const winCases = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export default class Board extends Component {
  state: State = {
    isPlayer: Math.floor(Math.random() * 2) === 0,
    isX: true,
    gameIsFinished: false,
    board: new Array(9).fill("-"),
    xHistory: [],
    yHistory: [],
    steps: 0,
    knowledge: {}
  };

  getWinner = (isPlayer: boolean, currentBoard?: string[]) => {
    const {
      state: { board }
    } = this;
    const current = currentBoard || board;
    for (let winCase of winCases) {
      const [a, b, c] = winCase;
      if (
        (current[a] === "X" || current[a] === "O") &&
        current[a] === current[b] &&
        current[b] === current[c]
      ) {
        return isPlayer ? 10 : -10;
      }
    }
    return current.find(value => value === "-") ? undefined : 0;
  };

  turnEnd = (code: number | undefined) => {
    if (code !== undefined) {
      this.setState({
        gameIsFinished: true
      });
      console.log("GAME ENDED", "Winner: ", this.state.isPlayer);
    }
  };

  resetBoard = () => {};

  minimax = (board: string[], isMaximising: boolean) => {
    const {
      state: { isX },
      getWinner
    } = this;
    const score = getWinner(isMaximising, board);
    if (score !== undefined) {
      return { score, index: 0 };
    }
    const moves: { score: number; index: number }[] = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "-") {
        const move: any = {};
        move.index = i;
        board[i] = isX && isMaximising ? "X" : "O";
        const result = this.minimax(board, !isMaximising);
        move.score = result.score;
        board[i] = "-";
        moves.push(move);
      }
    }
    let bestMove;
    if (isMaximising) {
      let bestScore = -1000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 1000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove || 0];
  };

  findBestMove = () => {
    const {
      state: { board, gameIsFinished },
      minimax,
      updateBoard
    } = this;
    if (!gameIsFinished) {
      const nextMove = minimax([...board], true);
      console.log(nextMove);
      updateBoard(nextMove.index);
    }
  };

  randomMove = () => {
    const {
      state: { board, gameIsFinished },
      updateBoard
    } = this;
    if (!gameIsFinished) {
      const availSpots = board
        .map((value, index) => (value === "-" ? index : -1))
        .filter(value => value !== -1);
      const index = Math.floor(Math.random() * availSpots.length);
      updateBoard(availSpots[index]);
    }
  };

  updateBoard = (index: number) => {
    const {
      state: { board, isX, isPlayer, steps },
      turnEnd,
      getWinner
    } = this;
    const nextBoard = [...board];
    console.log("update on index: " + index);
    nextBoard[index] = isX ? "X" : "O";
    const winner = getWinner(isPlayer, nextBoard);
    if (winner !== undefined) {
      this.setState(
        { gameIsFinished: true, board: nextBoard, steps: steps + 1 },
        () => {
          console.log("GAME ENDED", "Winner: ", this.state.isPlayer);
        }
      );
    } else {
      this.setState({
        board: nextBoard,
        steps: steps + 1,
        isX: !isX,
        isPlayer: !isPlayer
      });
    }
  };

  render() {
    const {
      state: { isPlayer, board, gameIsFinished },
      randomMove,
      findBestMove,
      updateBoard
    } = this;
    if (!isPlayer) {
      setTimeout(() => findBestMove(), 500);
    }
    return (
      <BoardContainer>
        <BoardHeader />
        <BoardGrid>
          {board.map((value, index) => (
            <Square
              key={index}
              index={index}
              value={value}
              gameIsFinished={gameIsFinished}
              isPlayer={isPlayer}
              toggle={updateBoard}
            />
          ))}
        </BoardGrid>
        <BoardFooter />
      </BoardContainer>
    );
  }
}
