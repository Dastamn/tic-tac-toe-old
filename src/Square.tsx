/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Component } from "react";

interface Props {
  value: string;
  index: number;
  isPlayer: boolean;
  gameIsFinished: boolean;
  toggle: (index: number) => void;
}

export default class Square extends Component<Props> {
  clickHandler = () => {
    const {
      props: { index, toggle }
    } = this;
    toggle(index);
  };

  render() {
    const {
      props: { value, isPlayer, gameIsFinished },
      clickHandler
    } = this;

    const canPlay = !gameIsFinished && isPlayer && value === "-";

    const cssStyle = css`
      align-items: center;
      border: solid;
      display: flex;
      height: 100px;
      justify-content: center;
      width: 100px;
      font-size: 3rem;
      cursor: default;
      transition: all 0.2s ease;

      ${canPlay &&
        `&:hover {
        background-color: gray;
        cursor: pointer;
      }`}
    `;

    return (
      <div css={cssStyle} onClick={canPlay ? clickHandler : () => {}}>
        {value === "-" ? "" : value}
      </div>
    );
  }
}
