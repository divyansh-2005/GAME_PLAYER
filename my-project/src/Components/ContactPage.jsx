import React from 'react';
import Header from './Header';

function ContactPage() {
  return (
    <div className='flex flex-col justify-between gap-[6vh]'>
      <Header />
      <section className='flex self-center w-[90%] lg:w-[70%] min-h-[calc(100vh-200px)] flex-col lg:flex-row items-stretch justify-around p-10 z-0'>
        {/* Left Section */}
        <section className="left bg-[#8694dd] lg:w-[40%] w-full hidden lg:flex flex-col p-10 justify-between text-[#01082D] lg:rounded-l-3xl flex-grow">
          <div>
            <div className='contact1 flex flex-col justify-start items-start p-3'>
              <div className='maintext flex justify-start mx-2 items-center gap-2'>
                <img src="https://img.icons8.com/?size=100&id=3726&format=png&color=000000" alt="chat" className='size-10 shadow-blue-100 shadow-md  p-1 rounded-xl' />
                <p className='text-[#01082D] font-extrabold '>Chat to Us</p>
              </div>
              <p className='text-[#23223d] px-14'>Our friendly team is here to help</p>
              <p className='text-[#01082D] px-14 font-bold'>support@telegames.com</p>
            </div>

            <div className='contact2 flex flex-col justify-start items-start p-3'>
              <div className='maintext flex justify-start mx-2 items-center gap-2'>
                <img src="https://img.icons8.com/?size=100&id=21614&format=png&color=000000" alt="visit us" className='size-10 shadow-blue-100 shadow-md 1 rounded-xl' />
                <p className='text-[#01082D] font-extrabold '>Visit Us</p>
              </div>
              <p className='text-[#23223d] px-14'>Come say hello at our office HQ</p>
              <p className='px-14 font-bold text-[#01082D]'>100 Smith Street,</p>
              <p className='px-14 font-bold text-[#01082D]'>Melbourne, VIC 3000,</p>
              <p className='px-14 font-bold text-[#01082D]'>Australia.</p>
            </div>

            <div className='contact3 flex flex-col justify-start items-start p-3'>
              <div className='maintext flex justify-start mx-2 items-center gap-2'>
                <img src="https://img.icons8.com/?size=100&id=3726&format=png&color=000000" alt="call us" className='size-10 shadow-blue-100 shadow-md 1 rounded-xl' />
                <p className='text-[#01082D] font-extrabold '>Call Us</p>
              </div>
              <p className='text-[#23223d] px-14'>Mon-Fri from 8am to 5pm</p>
              <p className='text-[#01082D] px-14 font-bold'>+1 (234) 567-8901</p>
            </div>
          </div>

          <section className="icons w-[50%] flex justify-between items-center mx-[10px]">
            <img src="https://img.icons8.com/?size=100&id=118468&format=png&color=000000" alt="facebook" className='size-12' />
            <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" className='size-11 text-[#3B1E54]' text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799">
              <path fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z" />
            </svg>
            <img src="https://img.icons8.com/?size=100&id=Uj9DyJeLazL6&format=png&color=000000" alt="linkedin" className='size-14' />
            <img src="https://img.icons8.com/?size=100&id=eRJfQw0Zs44S&format=png&color=000000" alt="insta" className='size-12' />
          </section>
        </section>

        {/* Right Section */}
        <section className="right bg-[#01082D] h-full lg:w-[60%] w-full lg:rounded-r-3xl rounded-3xl p-5 flex flex-col gap-[2vh] items-start flex-grow">
          <p className='text-[45px] text-wrap max-w-5xl flex text-start pt-[2vh] text-white'>
            Got ideas? We've got the skills. Let's team up.
          </p>
          <p className='text-white'>Tell us more about yourself and what you've got in mind.</p>
          
          {/* Name Input */}
          <input 
            type="text" 
            name="Name" 
            id="name" 
            className='bg-transparent w-full border-b-2 border-white outline-none placeholder:text-white py-4 text-white' 
            placeholder='Your Name'
          />

          {/* Email Input */}
          <input 
            type="email" 
            name="Email" 
            id="email" 
            className='bg-transparent w-full border-b-2 border-white outline-none placeholder:text-white py-4 text-white' 
            placeholder='you@company.com'
          />

          {/* Message Textarea */}
          <textarea 
            name="Message" 
            id="message" 
            cols="60" 
            rows="3" 
            className='bg-transparent w-full border-b-2 border-white outline-none placeholder:text-white py-4 text-white' 
            placeholder='Tell us a little about the project...'
            style={{ width: '100%', color: 'white', textTransform: 'none' }}
          />

          {/* Submit Button */}
          <button className='bg-blue-500 hover:bg-blue-700 hover:scale-100 rounded-sm my-5 text-white font-bold py-2 px-4 w-full mt-4 self-center'>
            Let's get Started
          </button>
        </section>
      </section>
    </div>
  );
}

export default ContactPage;
