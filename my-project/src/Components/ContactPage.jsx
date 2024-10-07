import React from 'react';
import Header from './Header';
import styles from './ContactPage.module.css'; // Import the CSS module for styling

function ContactPage() {
  return (
    <>
      <Header />
      {/* <div className={styles.body}>
        <div className={styles.container}>
          <h2 className={styles.title}>Contact Us</h2>
          <p className={styles.pTitle}>We'd love to hear from you!</p>
          <p className={styles.pPara}>
            If you have any questions, feedback, or inquiries about our platform, feel free to reach out to us. Our team is here to assist you and ensure you have the best gaming experience possible.
          </p>
          
          <h2 className={styles.subTitle}>Contact Information</h2>
          <p className={styles.pPara}>
            <strong>Email:</strong> support@telegames.com
          </p>
          <p className={styles.pPara}>
            <strong>Phone:</strong> +1 (234) 567-8901
          </p>
          <p className={styles.pPara}>
            <strong>Follow us on social media:</strong>
            <br />
            <a href="https://twitter.com/telegames" target="_blank" rel="noopener noreferrer">Twitter</a> | 
            <a href="https://facebook.com/telegames" target="_blank" rel="noopener noreferrer">Facebook</a> | 
            <a href="https://instagram.com/telegames" target="_blank" rel="noopener noreferrer">Instagram</a>
          </p>
          
        </div>
      </div> */}



      <div>
        <div className='flex justify-center items-center flex-col mt-10 gap-3'>
          <p className='text-7xl'>Get in touch</p>
          <p>Reach out, and let's create a universe of possibilities together!</p>
        </div>
        <div className=' w-[80%] mx-auto p-10'>
          <div className='shadow-xl bg-gray-700 rounded-2xl flex items-center flex-col md:flex-row justify-between p-5 ' >
            
            <div className=' order-2 md:order-1 w-full md:w-1/2 p-5 space-y-5'>
              <div className=' text-center'>
                <p className='text-5xl'>Let's Connect</p>
                <p className=' '>will try to reach out to you soon!</p>
              </div>
              {/* left */}
              <form action="" className='space-y-5'>
                <div className='md:space-x-5 space-y-5'>
                  {/* <div>first name</div>
                  <div>last name</div> */}
                  <input className='p-4 text-xl md:w-[49%] w-full bg-gray-600 rounded-lg text-white border-none' type="text"
                    placeholder='First name' />
                  <input className='p-4 text-xl md:w-[48%] w-full bg-gray-600 rounded-lg text-white border-none' type="text"
                    placeholder='Last name' />
                </div>

                <div>
                  <input className='p-4 text-xl w-full  bg-gray-600 rounded-lg text-white border-none' type="text"
                    placeholder='Enter email' />
                </div>
                <div>
                  <input className='p-4 text-xl w-full  bg-gray-600 rounded-lg text-white border-none' type="text"
                    placeholder='Enter phone number' />
                </div>

                <div>
                  <textarea className='p-4 text-xl w-full  bg-gray-600 rounded-lg text-white border-none'
                    name="" id=""
                    placeholder='Enter your message'
                    rows={5}></textarea>

                </div>
              </form>
              <button className='border-1 border-blue-500 hover:bg-blue-500 h-16 text-xl w-full rounded-lg text-white ' >send to developer 🚀</button>
            </div>
            {/* right */}
            <div className='order-1 w-full md:w-1/2 flex justify-center items-center'>
              <img className='w-[70%] rounded-xl' src="/logo.jpg" alt="" />
            </div>
          </div>

        </div>
      </div>

    </>
  );
}

export default ContactPage;
