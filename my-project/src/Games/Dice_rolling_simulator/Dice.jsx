
import { useState, useEffect } from 'react';



import dice1 from './dice_1.png';
import dice2 from './dice_2.png';
import dice3 from './dice_3.png';
import dice4 from './dice_4.png';
import dice5 from './dice_5.png';
import dice6 from './dice_6.png';

const DiceRoller = () => {
  const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];
  const colors = ['bg-red-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-700', 'bg-pink-500',"bg-blue-900","bg-purple-800"];

  const [dice1Image, setDice1Image] = useState(dice1);
  const [dice2Image, setDice2Image] = useState(dice1);
  const [bgColor, setBgColor] = useState('bg-black');

  // Function to roll the dice with animation
  const diceRoll = () => {
    let rollCount = 0;

    const interval = setInterval(() => {
      // Randomize dice images
      const randomDice1 = diceImages[Math.floor(Math.random() * diceImages.length)];
      const randomDice2 = diceImages[Math.floor(Math.random() * diceImages.length)];
      // Randomize background color
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setDice1Image(randomDice1);
      setDice2Image(randomDice2);
      setBgColor(randomColor);
      rollCount++;

      // Stop the animation after 10 iterations
      if (rollCount > 10) {
        clearInterval(interval);
        setBgColor('bg-black'); // Reset background color to black
      }
    }, 100); // Roll the dice every 100ms for the animation effect
  };

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${bgColor} transition-colors duration-200`}>
      <h1 className="text-4xl w-64 h-16 rounded-full mt-4 bg-slate-600 text-white mb-6">Dice Roll</h1>
      <div className="flex items-center justify-center space-x-8">
        <img src={dice1Image} alt="Dice 1" className="w-[400px] h-[400px]" />
        <img src={dice2Image} alt="Dice 2" className="w-[400px] h-[400px]" />
      </div>
      <button
        onClick={diceRoll}
        className="mt-10 h-[60px] w-[100px] bg-violet-500 text-white px-6 py-3 text-xl font-bold rounded-lg hover:bg-green-600 transition duration-300"
      >
        ROLL
      </button>
    </div>
  );
};

export default DiceRoller;