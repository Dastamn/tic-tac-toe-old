import React, { Component } from "react";
import Game from "./Game";

class Main extends Component {
  render() {
    const player = Math.floor(Math.random() * 2) === 0 ? "X" : "O";
    const computer = player === "X" ? "O" : "X";

    return (
      <div>
        <Game />
      </div>
    );
  }
}

export default Main;
