/** @format */

import React from "react";
import Header from "./Header";

function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center text-gray-100 py-16 px-4">
        <div className="max-w-6xl bg-opacity-70 bg-gray-800 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-8 space-y-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-indigo-800">
          <h2 className="text-4xl font-extrabold text-center text-indigo-200 mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-center text-gray-300 max-w-lg mx-auto">
            We'd love to hear from you! Whether you have questions, feedback, or
            just want to say hello, feel free to reach out.
          </p>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-indigo-300">
              Contact Information
            </h3>
            <p className="text-lg text-gray-300">
              <strong className="text-indigo-400">Email:</strong>{" "}
              <a
                href="mailto:support@telegames.com"
                className="hover:text-indigo-400"
              >
                support@telegames.com
              </a>
            </p>
            <p className="text-lg text-gray-300">
              <strong className="text-indigo-400">Phone:</strong> +1 (234)
              567-8901
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-indigo-300">
              Follow Us
            </h3>
            <div className="flex space-x-6 justify-center">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-2xl transform transition-all duration-300 hover:scale-110"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800 text-2xl transform transition-all duration-300 hover:scale-110"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-600 text-2xl transform transition-all duration-300 hover:scale-110"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-300 mt-4">
              Have a question? Drop us a message, and we'll get back to you as
              soon as possible.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;
