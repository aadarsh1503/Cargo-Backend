// src/components/rate-form/ReviewPage.jsx

import React from 'react';

const ReviewPage = ({ rates, onEdit, onSubmit }) => (
    <div className="p-8 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 animate-fade-in space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Confirm Your Submission</h2>
        <p className="text-center text-gray-600">Please review all rate entries below before final submission.</p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {rates.map((rate, index) => (
                <div key={rate.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-700 mb-3 border-b pb-2">Entry #{index + 1}: {rate.polPort} → {rate.podPort}</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">20GP Rate:</span><span className="font-semibold text-gray-800">${rate.price20gp}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Validity:</span><span className="font-semibold text-gray-800">{rate.validity}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">40GP Rate:</span><span className="font-semibold text-gray-800">${rate.price40gp}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Transit Days:</span><span className="font-semibold text-gray-800">{rate.transitDays}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">40HQ Rate:</span><span className="font-semibold text-gray-800">${rate.price40hq}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Free Days:</span><span className="font-semibold text-gray-800">{rate.daysFree}</span></div>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center pt-6 border-t mt-4">
            <button onClick={onEdit} className="px-6 py-2 bg-transparent border border-gray-400 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all">
                ← Go Back & Edit
            </button>
            <button onClick={onSubmit} className="px-8 py-3 bg-[#0077b6] text-white font-bold rounded-lg hover:bg-[#023e8a] transition-all transform hover:scale-105 shadow-lg">
                Confirm & Submit All
            </button>
        </div>
    </div>
);

export default ReviewPage;