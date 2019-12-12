import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import styled from "@emotion/styled";
import Game from "./components/Game";

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 80px;
`;

ReactDOM.render(
  <Container>
    <Game />
  </Container>,
  document.getElementById("root")
);
