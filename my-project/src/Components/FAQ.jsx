import React, { useState } from 'react'
import Header from './Header';

const FAQ = () => {

    

    return (

        <>
            <Header />
            
                <div className='mt-10 mb-20 '>
                    <p className='md:text-7xl text-5xl text-center'>FREQUENTLY ASKED QUESTIONS</p>
                </div>
            <div className='md:w-[50%] w-[80%] mx-auto space-y-7'>

                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" defaultChecked />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">Is this project open-source?
                    </div>
                    <div className="collapse-content">
                        <p>Yes, this project is open-source, and you can find the code on our GitHub repository. Feel free to explore, contribute, or fork the project.</p>
                    </div>
                </div>
                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" defaultChecked />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">What is the purpose of this project?
                    </div>
                    <div className="collapse-content ">
                        <p>This project aims to provide users with easy access to information and support.</p>
                    </div>
                </div>
                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">How can I contact support team?</div>
                    <div className="collapse-content">
                        <p>You can reach support through the contact us section or our real-time messaging feature.</p>
                    </div>
                </div>
                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">Can I contribute to this project?</div>
                    <div className="collapse-content">
                        <p>Yes, we welcome contributions! You can find our contribution guidelines on GitHub or contact us directly for collaboration opportunities.</p>
                    </div>
                </div>
                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">How do I report a bug or suggest a feature?</div>
                    <div className="collapse-content">
                        <p>You can report bugs or suggest features via our GitHub repository or through the feedback form available in the Contact Us section.</p>
                    </div>
                </div>
                <div className="collapse collapse-plus bg-base-200 space-y-2">
                    <input type="radio" name="my-accordion-3" />
                    <div className="collapse-title md:text-3xl text-2xl font-medium">How do I install the project locally?</div>
                    <div className="collapse-content">
                        <p>To install the project locally, clone the repository and follow the setup instructions in the README file.</p>
                    </div>
                </div>

            </div>

        </>
    )
}

export default FAQ
