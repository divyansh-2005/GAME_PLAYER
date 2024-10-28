import React from 'react';
import Header from './Header';
import { MapPin, Mail, PhoneCallIcon, Instagram, Facebook, Github, Linkedin } from 'lucide-react';

const ContactPage = () => {
  const styles = {
    fontSize: '2rem', 
    '@media (max-width: 470px)': { 
      fontSize: '0.5rem',
    },
  };
  return (
    <div className='contactpage flex flex-col'>
      <Header />
      <div className="maincard mb-5 bg-white shadow-lg relative shadow-purple-400 rounded-lg w-[70vw] self-center md:h-[calc(95vh-60px)] mt-[5vh]">
        <div className="smallcard m-5 h-[60%] md:h-[80%] md:w-[35%] w-[70%] bg-[#0f3f6f] shadow-2xl justify-around flex p-[2vw] flex-col items-center md:items-start gap-[2vw] absolute md:-left-20 md:top-[10vh] -bottom-[44vh] left-[10vw] shadow-black-300 font-xl">
          <p className='text-6xl md:text-start text-center font-mono'>Contact Us</p>
          <div className='contactprofiles font-sans md:text-3xl text-2xl flex flex-col md:gap-[2.5vw] gap-[1.5vw] opacity-85'>
            <div className='flex gap-4 items-start justify-start text-start'>
              <span><MapPin /></span>100 Smith Street<br />Melbourne, VIC 3000<br />Australia
            </div>
            <div className='flex gap-4 items-start justify-start text-start'>
              <span><Mail /></span>support@telegames.com
            </div>
            <div className='flex gap-4 items-start justify-start text-start'>
              <span><PhoneCallIcon /></span>+1 (234) 567-8901
            </div>
          </div>
          <div className='socialprofiles flex gap-[2vw] opacity-80'>
            <Instagram />
            <Facebook />
            <Github />
            <Linkedin />
          </div>
        </div>
        <div className='textpart  flex flex-col md:w-[50%] md:mx-[40%]  my-[4vw] justify-start'>
          <div className='flex flex-col justify-center md:gap-[2vw]  gap-[4vw] items-center'>
            <p className='md:text-7xl text-5xl text-black font-mono font-extrabold'>Get in touch</p>
            <p className='md:text-4xl text-2xl text-gray-600 ml-[1rem] font-serif'>Feel free to drop us a line below</p>
            <div className='w-[70%] bg-[#b5ddfd] bg-opacity-55 rounded-lg border-b-2 text-blue-950 text-4xl transition-colors duration-500 border-transparent focus-within:border-[#09123e]'>
            <input
  type="text"
  name="name"
  id="name"
  placeholder="Your Name"
  className="placeholder:text-gray-400 text-4xl p-4 bg-transparent w-full rounded-lg outline-none appearance-none"
  style={styles}
/>


            </div>
            
            <div className='w-[70%] bg-[#b5ddfd] bg-opacity-55 rounded-lg border-b-2 text-blue-950 text-4xl transition-colors duration-500 border-transparent focus-within:border-[#09123e]'>
            <input
  type="email"
  name="email"
  id="email"
  placeholder="Your Email"
  className="placeholder:text-gray-400 text-4xl p-4 bg-transparent w-full rounded-lg outline-none appearance-none"
  style={{ fontSize: '2rem' }}
/>


            </div>
            <div className='w-[70%] bg-[#b5ddfd] bg-opacity-55 rounded-lg border-b-2 text-blue-950 text-4xl transition-colors duration-500 border-transparent focus-within:border-[#09123e]'>
            <textarea
  name="name"
  id="name"
  placeholder="Tell Us about Yourself"
  className="placeholder:text-gray-400 text-4xl p-4 bg-transparent w-full rounded-lg outline-none appearance-none"
  style={{ fontSize: '2rem' }}
  rows={"5"}
/>


            </div>
            <button style={{fontSize:"1.5rem"}} className='bg-gradient-to-r from-[#0f3f6f] to-[#0f3f6f] border-2 border-transparent via-[#49739c] w-[30%] md:h-[6vh] h-[4vh] hover:border-[#0f3f6f] '>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
