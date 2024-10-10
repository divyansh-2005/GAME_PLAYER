// import React from 'react';
// import {Link} from 'react-router-dom';

// const Footer = () => (
//   <div className="footer-basic">
//     <footer>
//       <ul className="list-inline">
//         <li className="list-inline-item"><Link to={'/'}><i className="fa fa-home" aria-hidden="true"></i> Home</Link></li>
//         <li className="list-inline-item"><Link to={'/'}><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Games</Link></li>
//         <li className="list-inline-item"><Link to={'/'}><i className="fa fa-calculator" aria-hidden="true"></i> About</Link></li>
//         <li className="list-inline-item"><Link to={'/'}><i className="fa fa-users" aria-hidden="true"></i> Contact</Link></li>
//       </ul>
//       <p className="copyright">TeleGames &copy; 2024</p>
//     </footer>
//   </div>


// );

// export default Footer;

import React from 'react'
const social = [
  { platform: 'Instagram', icon: '/insta.svg', link: 'https://www.instagram.com/telegames/' },
  { platform: 'Twitter', icon: '/twitter.svg', link: 'https://twitter.com/telegames' },
  { platform: 'Twitter', icon: '/facebook.svg', link: 'https://www.facebook.com/telegames' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-indigo-950 to-black text-white pt-32 pb-0">
      <div className="max-w-6xl mx-auto grid-cols-1 md:grid-cols-4 gap-8 mb-8 flex flex-col space-y-16 md:flex md:flex-row justify-center items-center">
        <div className="col-span-1 md:col-span-2 space-y-12 ">
          <p className="mb-6 max-w-md text-3xl">
          TeleGames: A curated collection of engaging games for endless fun and entertainment.
          </p>
          <div className="flex gap-14 flex-wrap ">
            {social.map((link) => (
              <a
              key={link.platform}
              href={link.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-2xl p-2 md:p-3"
              >
              <img src={link.icon} alt={link.platform} className="w-10 h-10" />
              </a>
        ))}
      </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 text-3xl">Links</h3>
          <ul className="space-y-2 text-xl">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About us</a></li>
            <li><a href="/games">Explore Games</a></li>
            <li><a href="/contact">Contact us</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 text-3xl">QUICK LINKS</h3>
          <ul className="space-y-2 text-xl">
            <li><a href="/addgame">Add Games</a></li>
            <li><a href="/emojiintruder">Emoji Intruder</a></li>
            <li><a href="/snakegame">Snake Game</a></li>
           
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center lg:tracking-[3em] md:tracking-tight sm:tracking-[.8em]">
        <h2 className="lg:text-[15rem] md:text-[13rem] sm:text-[10rem] text-[5rem] text-slate-700">TeleGames</h2>
      </div>
      
    </footer>
  )
}