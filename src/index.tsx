import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import styled from "@emotion/styled";
import Game from "./components/Game";

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 50px 0;
`;

const d = {};
if (d) {
  console.log("ok");
} else {
  console.log("not ok");
}

ReactDOM.render(
  <Container>
    <Game />
  </Container>,
  document.getElementById("root")
);
