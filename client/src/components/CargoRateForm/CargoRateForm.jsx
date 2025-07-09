// src/components/rate-form/CargoRateForm.jsx

import React, { useState } from 'react';
import RateEntryRow from '../RateEntryRow/RateEntryRow';
import ReviewPage from '../ReviewPage/ReviewPage';
import SuccessPage from '../SuccessPage/SuccessPage';
import "./r.css"

// DUMMY DATA: In a real app, this comes from an API
const countryPortData = {
    "China": ["Qingdao", "Shenzhen", "Ningbo", "Shanghai", "FOSHAN/SHUNDE/HUANGPU", "Nansha", "Tianjin"],
    "KSA": ["Jeddah", "Dammam", "King Abdullah Port"],
    "UAE": ["Jebel Ali", "Abu Dhabi", "Sharjah"],
    "USA": ["Los Angeles", "New York", "Savannah"],
    "Germany": ["Hamburg", "Bremen"]
};

// Helper to create a new blank rate object
const createNewRate = () => ({
    id: Date.now() + Math.random(),
    polCountry: '', polPort: '',
    podCountry: '', podPort: '',
    price20gp: '', price40gp: '', price40hq: '',
    validity: '', transitDays: '', daysFree: '',
    availablePolPorts: [], availablePodPorts: [],
});

export default function CargoRateForm() {
    const [step, setStep] = useState(1);
    const [rates, setRates] = useState([createNewRate()]);
    const [error, setError] = useState(null);

    const handleRateChange = (index, event) => {
        setError(null);
        const { name, value } = event.target;
        const updatedRates = [...rates];
        updatedRates[index][name] = value;
        setRates(updatedRates);
    };

    const handleCountryChange = (index, event, portType) => {
        setError(null);
        const country = event.target.value;
        const ports = countryPortData[country] || [];
        const updatedRates = [...rates];
        
        if (portType === 'pol') {
            updatedRates[index].polCountry = country;
            updatedRates[index].polPort = '';
            updatedRates[index].availablePolPorts = ports;
        } else {
            updatedRates[index].podCountry = country;
            updatedRates[index].podPort = '';
            updatedRates[index].availablePodPorts = ports;
        }
        setRates(updatedRates);
    };

    const addRateRow = () => {
        setRates([...rates, createNewRate()]);
    };

    const removeRateRow = (index) => {
        const filteredRates = rates.filter((_, i) => i !== index);
        setRates(filteredRates);
    };
    
    const handleNextStep = (e) => {
        e.preventDefault();
        setError(null);

        const routeCombinations = new Set();
        for (const rate of rates) {
            if (!rate.polPort || !rate.podPort) {
                 setError("All routes must have a POL and POD port selected.");
                 return;
            }
            const routeKey = `${rate.polPort}-${rate.podPort}`;
            if (routeCombinations.has(routeKey)) {
                setError(`Duplicate route found: ${rate.polPort} → ${rate.podPort}. Each route must be unique.`);
                return;
            }
            routeCombinations.add(routeKey);
        }
        
        setStep(2);
    };

    const handleSubmit = () => {
        console.log("Final Submission Data (Array of Rates):", rates);
        setStep(3);
    };

    const handleReset = () => {
        setRates([createNewRate()]);
        setError(null);
        setStep(1);
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleNextStep} className="space-y-6 font-noto-serif animate-fade-in">
                        {rates.map((rate, index) => (
                            <RateEntryRow
                                key={rate.id}
                                rate={rate}
                                index={index}
                                onRateChange={handleRateChange}
                                onCountryChange={handleCountryChange}
                                onRemoveRow={removeRateRow}
                                countryPortData={countryPortData}
                                isOnlyRow={rates.length === 1}
                            />
                        ))}
                        <div className="flex justify-between items-center pt-4">
                            <button type="button" onClick={addRateRow} className="px-6 py-2 bg-white/90 text-[#0077b6] border border-[#0077b6] font-bold rounded-lg hover:bg-[#0077b6] hover:text-white transition-all duration-300">
                                + Add Another Rate
                            </button>
                            <div className="flex flex-col items-end">
                                {error && <p className="text-red-500 bg-white/80 rounded-md px-3 py-1 mb-2 font-semibold text-sm animate-fade-in">{error}</p>}
                                <button type="submit" className="px-8 py-3 bg-[#0077b6] text-white font-bold rounded-lg hover:bg-[#023e8a] transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    Review All Entries
                                </button>
                            </div>
                        </div>
                    </form>
                );
            case 2:
                return <ReviewPage rates={rates} onEdit={() => setStep(1)} onSubmit={handleSubmit} />;
            case 3:
                return <SuccessPage count={rates.length} onReset={handleReset} />;
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-screen w-full font-noto-serif flex items-center justify-center p-4 font-sans text-gray-800">
            <video autoPlay loop muted className="absolute z-[-2] w-full h-full object-cover"><source src="https://videos.pexels.com/video-files/3716143/3716143-hd_1920_1080_25fps.mp4" type="video/mp4" /></video>
            <div className="absolute z-[-1] w-full h-full bg-black/60"></div>

            <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
  <a href="https://your-link.com">
    <img
      src="i1.png"
      alt="Company Logo"
      className="mx-auto h-36 drop-shadow-lg mb-[-24px]"
    />
  </a>
  <p className="text-gray-200 text-lg drop-shadow-md">
    A seamless portal for our valued shipping partners.
  </p>
</div>


                {renderCurrentStep()}
            </div>
        </div>
    );
}