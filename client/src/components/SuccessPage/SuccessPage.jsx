// src/components/rate-form/SuccessPage.jsx

import React from 'react';

const SuccessIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#0096c7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const SuccessPage = ({ count, onReset }) => (
    <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 animate-fade-in flex flex-col items-center text-center space-y-4">
        <SuccessIcon />
        <h2 className="text-3xl font-bold text-gray-800">Submission Received!</h2>
        <p className="text-lg text-gray-600 max-w-md">Thank you. Your batch of {count} rate(s) has been successfully submitted for review.</p>
        <button onClick={onReset} className="mt-4 px-8 py-3 bg-[#0077b6] text-white font-bold rounded-lg hover:bg-[#023e8a] transition-all transform hover:scale-105 shadow-lg">
            Submit Another Batch
        </button>
    </div>
);

export default SuccessPage;