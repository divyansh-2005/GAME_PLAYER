import React from 'react';
import Header from './Header';
import { MapPin, Mail, PhoneCallIcon, Instagram, Facebook, Github, Linkedin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className='contactpage flex flex-col'>
      <Header />
      <div className="maincard bg-white shadow-lg relative shadow-purple-400 rounded-lg w-[70vw] self-center h-[calc(95vh-70px)] mt-[5vh]">
        <div className="smallcard h-[80%] w-[35%] bg-[#0f3f6f] shadow-2xl justify-around flex p-[2vw] flex-col gap-[2vw] absolute -left-20 top-[10vh] shadow-black-300 font-2xl">
          <p className='text-6xl text-start font-mono'>Contact Us</p>
          <div className='contactprofiles font-sans text-3xl flex flex-col gap-[2.5vw] opacity-85'>
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
          <div className='socialprofiles flex gap-[1vw] opacity-80'>
            <Instagram />
            <Facebook />
            <Github />
            <Linkedin />
          </div>
        </div>
        <div className='textpart  flex flex-col w-[50%] mx-[40%] my-[2vw] justify-start'>
          <div className='flex flex-col justify-center gap-[2vw] items-center'>
            <p className='text-7xl text-black font-mono font-extrabold'>Get in touch</p>
            <p className='text-4xl text-gray-600 ml-[1rem] font-serif'>Feel free to drop us a line below</p>
            <div className='w-[70%] bg-[#b5ddfd] bg-opacity-55 rounded-lg border-b-2 text-blue-950 text-4xl transition-colors duration-500 border-transparent focus-within:border-[#09123e]'>
            <input
  type="text"
  name="name"
  id="name"
  placeholder="Your Name"
  className="placeholder:text-gray-400 text-4xl p-4 bg-transparent w-full rounded-lg outline-none appearance-none"
  style={{ fontSize: '2rem' }}
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
            <button style={{fontSize:"2rem"}} className='bg-gradient-to-r from-[#0f3f6f] to-[#0f3f6f] border-2 border-transparent via-[#49739c] w-[30%] h-[2vw] hover:border-[#0f3f6f]'>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
