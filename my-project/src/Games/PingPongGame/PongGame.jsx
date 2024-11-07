/** @format */

import React, { useEffect, useRef } from "react";
import "./Pong.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

const PongGame = () => {
  const canvasRef = useRef(null);
  const paddleSpeed = 6;
  const ballSpeed = 3;
  const grid = 15;
  const paddleHeight = grid * 9;

  let leftPaddle = {
    x: grid * 2,
    y: 0,
    width: grid,
    height: paddleHeight,
    dy: 0,
  };

  let rightPaddle = {
    x: 0,
    y: 0,
    width: grid,
    height: paddleHeight,
    dy: 0,
  };

  let ball = {
    x: 0,
    y: 0,
    width: grid,
    height: grid,
    dx: ballSpeed,
    dy: -ballSpeed,
    resetting: false,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const maxPaddleY = canvas.height - grid - paddleHeight;

    leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
    rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
    rightPaddle.x = canvas.width - grid * 3;

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const collides = (obj1, obj2) => {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      );
    };

    const update = (delta) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      leftPaddle.y += leftPaddle.dy;
      rightPaddle.y += rightPaddle.dy;

      if (leftPaddle.y < grid) leftPaddle.y = grid;
      else if (leftPaddle.y > maxPaddleY) leftPaddle.y = maxPaddleY;

      if (rightPaddle.y < grid) rightPaddle.y = grid;
      else if (rightPaddle.y > maxPaddleY) rightPaddle.y = maxPaddleY;

      context.fillStyle = "white";
      context.fillRect(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height
      );
      context.fillRect(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height
      );

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y < grid || ball.y + grid > canvas.height - grid) {
        ball.dy *= -1;
      }

      if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
        ball.resetting = true;
        setTimeout(() => {
          ball.resetting = false;
          ball.x = canvas.width / 2;
          ball.y = canvas.height / 2;
        }, 400);
      }

      if (collides(ball, leftPaddle)) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + leftPaddle.width;
      } else if (collides(ball, rightPaddle)) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.width;
      }

      context.fillRect(ball.x, ball.y, ball.width, ball.height);

      context.fillStyle = "lightgrey";
      context.fillRect(0, 0, canvas.width, grid);
      context.fillRect(0, canvas.height - grid, canvas.width, grid);

      for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
      }
    };

    let lastTime = 0;
    const loop = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      update(delta);
      requestAnimationFrame(loop);
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
      if (e.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
      if (e.key === "w") leftPaddle.dy = -paddleSpeed;
      if (e.key === "s") leftPaddle.dy = paddleSpeed;
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") rightPaddle.dy = 0;
      if (e.key === "w" || e.key === "s") leftPaddle.dy = 0;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <>
      <Header />
      <Back />
      <h1 className="text-3xl sm:text-4xl md:text-6xl text-center text-white font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-600 to-blue-500 p-4 rounded-lg shadow-lg">
        Ping Pong Game
      </h1>
      <canvas
        ref={canvasRef}
        width="750"
        height="585"
        className="border-4 border-gray-800 rounded-lg shadow-xl mx-auto"
      />

      <Footer />
    </>
  );
};

export default PongGame;
