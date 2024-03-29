/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Component } from "react";

interface Props {
  index: number;
  value: string;
  isPlayer: boolean;
  winner: boolean;
  toggle: (index: number) => void;
}

class Cell extends Component<Props> {
  clickHandler = (
    index: number,
    value: string,
    toggle: (index: number) => void
  ) => value === "-" && toggle(index);

  render() {
    const {
      props: { index, value, winner, toggle, isPlayer },
      clickHandler
    } = this;

    const style = css`
      align-items: center;
      border: solid;
      display: flex;
      height: 100px;
      justify-content: center;
      width: 100px;
      font-size: 3rem;
      cursor: default;
      transition: all 0.2s ease;

      ${!winner &&
        value === "-" &&
        `&:hover {
      background-color: gray;
      cursor: pointer;
    }`}
    `;

    return (
      <div
        css={style}
        onClick={() => (isPlayer ? clickHandler(index, value, toggle) : {})}
      >
        {value === "-" ? "" : value}
      </div>
    );
  }
}

export default Cell;
