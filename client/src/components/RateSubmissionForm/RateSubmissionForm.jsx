import React, { useState } from 'react';

// --- ICONS (No changes here) ---
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-[#0077b6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.255 15.255L20.745 8.745M3.255 8.745L20.745 15.255" /></svg>);
const PriceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-[#0077b6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M12 2.25v.01M12 19.5v.01M4.5 12h.01M19.5 12h.01M6.343 17.657l.01-.01M17.657 6.343l-.01.01" /></svg>);
const CalendarClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-[#0077b6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 15.75h.008v.008H12v-.008z" /></svg>);
const SuccessIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#0096c7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- DUMMY DATA ---
const countryPortData = {
    "China": ["Qingdao", "Shenzhen", "Ningbo", "Shanghai", "FOSHAN/SHUNDE/HUANGPU", "Nansha", "Tianjin"],
    "KSA": ["Jeddah", "Dammam", "King Abdullah Port"],
    "UAE": ["Jebel Ali", "Abu Dhabi", "Sharjah"],
    "USA": ["Los Angeles", "New York", "Savannah"],
    "Germany": ["Hamburg", "Bremen"]
};

// --- Helper function to create a new blank rate object ---
const createNewRate = () => ({
    id: Date.now() + Math.random(), // Unique ID for React key
    polCountry: '', polPort: '',
    podCountry: '', podPort: '',
    price20gp: '', price40gp: '', price40hq: '',
    validity: '', transitDays: '', daysFree: '14',
    // Each row needs its own list of available ports
    availablePolPorts: [],
    availablePodPorts: [],
});


export default function CargoRateForm() {
    const [step, setStep] = useState(1);
    const [rates, setRates] = useState([createNewRate()]); // Start with one rate entry
    const [error, setError] = useState(null);

    // --- Core Logic for Handling Multiple Rows ---

    const handleRateChange = (index, event) => {
        setError(null); // Clear error on any change
        const { name, value } = event.target;
        const updatedRates = [...rates];
        updatedRates[index][name] = value;
        setRates(updatedRates);
    };

    const handleCountryChange = (index, event, portType) => {
        setError(null); // Clear error on any change
        const country = event.target.value;
        const ports = countryPortData[country] || [];
        const updatedRates = [...rates];
        
        if (portType === 'pol') {
            updatedRates[index].polCountry = country;
            updatedRates[index].polPort = ''; // Reset port on country change
            updatedRates[index].availablePolPorts = ports;
        } else {
            updatedRates[index].podCountry = country;
            updatedRates[index].podPort = ''; // Reset port on country change
            updatedRates[index].availablePodPorts = ports;
        }
        setRates(updatedRates);
    };

    const addRateRow = () => {
        setRates([...rates, createNewRate()]);
    };

    const removeRateRow = (index) => {
        if (rates.length <= 1) return; // Don't remove the last row
        const filteredRates = rates.filter((_, i) => i !== index);
        setRates(filteredRates);
    };
    
    // --- Navigation and Submission Logic ---

    const handleNextStep = (e) => {
        e.preventDefault();
        setError(null);

        // ** DUPLICATE CHECK LOGIC **
        const routeCombinations = new Set();
        for (const rate of rates) {
            if (!rate.polPort || !rate.podPort) {
                 setError("All routes must have a POL and POD port selected.");
                 return;
            }
            const routeKey = `${rate.polPort}-${rate.podPort}`;
            if (routeCombinations.has(routeKey)) {
                setError(`Duplicate route found: ${rate.polPort} → ${rate.podPort}. Each route must be unique.`);
                return; // Stop submission
            }
            routeCombinations.add(routeKey);
        }
        
        setStep(2); // Proceed if no duplicates are found
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
    

    // --- RENDER FUNCTIONS FOR EACH STEP ---

    const renderFormStep = () => (
        <form onSubmit={handleNextStep} className="space-y-4 animate-fade-in">
            {rates.map((rate, index) => (
                 <div key={rate.id} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 space-y-4 relative">
                    <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4">
                        <h3 className="text-xl font-bold text-gray-700">Rate Entry #{index + 1}</h3>
                        {rates.length > 1 && (
                            <button type="button" onClick={() => removeRateRow(index)} className="text-red-600 hover:text-red-800 font-semibold">
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Route Selection */}
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                        <select name="polCountry" value={rate.polCountry} onChange={(e) => handleCountryChange(index, e, 'pol')} required className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]">
                            <option value="">-- Select POL Country --</option>
                            {Object.keys(countryPortData).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select name="polPort" value={rate.polPort} onChange={(e) => handleRateChange(index, e)} required disabled={!rate.polCountry} className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-200 disabled:cursor-not-allowed">
                            <option value="">-- Select POL Port --</option>
                            {rate.availablePolPorts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select name="podCountry" value={rate.podCountry} onChange={(e) => handleCountryChange(index, e, 'pod')} required className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]">
                             <option value="">-- Select POD Country --</option>
                            {Object.keys(countryPortData).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select name="podPort" value={rate.podPort} onChange={(e) => handleRateChange(index, e)} required disabled={!rate.podCountry} className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-200 disabled:cursor-not-allowed">
                             <option value="">-- Select POD Port --</option>
                            {rate.availablePodPorts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                     {/* Rates & Details */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="number" name="price20gp" value={rate.price20gp} onChange={(e) => handleRateChange(index, e)} required placeholder="Price 20GP" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                        <input type="number" name="price40gp" value={rate.price40gp} onChange={(e) => handleRateChange(index, e)} required placeholder="Price 40GP" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                        <input type="number" name="price40hq" value={rate.price40hq} onChange={(e) => handleRateChange(index, e)} required placeholder="Price 40HQ" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                        <input type="date" name="validity" value={rate.validity} onChange={(e) => handleRateChange(index, e)} required className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] [color-scheme:light]" />
                        <input type="number" name="transitDays" value={rate.transitDays} onChange={(e) => handleRateChange(index, e)} required placeholder="Transit Days" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                        <input type="number" name="daysFree" value={rate.daysFree} onChange={(e) => handleRateChange(index, e)} required placeholder="Days Free" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                    </div>
                </div>
            ))}
            
            {/* Form Actions */}
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

    const renderReviewStep = () => (
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
                <button onClick={() => setStep(1)} className="px-6 py-2 bg-transparent border border-gray-400 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all">
                    ← Go Back & Edit
                </button>
                <button onClick={handleSubmit} className="px-8 py-3 bg-[#0077b6] text-white font-bold rounded-lg hover:bg-[#023e8a] transition-all transform hover:scale-105 shadow-lg">
                    Confirm & Submit All
                </button>
            </div>
        </div>
    );

    const renderSuccessStep = () => (
         <div className="p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 animate-fade-in flex flex-col items-center text-center space-y-4">
            <SuccessIcon />
            <h2 className="text-3xl font-bold text-gray-800">Submission Received!</h2>
            <p className="text-lg text-gray-600 max-w-md">Thank you. Your batch of {rates.length} rate(s) has been successfully submitted for review.</p>
            <button onClick={handleReset} className="mt-4 px-8 py-3 bg-[#0077b6] text-white font-bold rounded-lg hover:bg-[#023e8a] transition-all transform hover:scale-105 shadow-lg">
                Submit Another Batch
            </button>
        </div>
    );

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans text-gray-800">
            {/* Background Video & Overlay */}
            <video autoPlay loop muted className="absolute z-[-2] w-full h-full object-cover"><source src="https://videos.pexels.com/video-files/3716143/3716143-hd_1920_1080_25fps.mp4" type="video/mp4" /></video>
            <div className="absolute z-[-1] w-full h-full bg-black/60"></div>

            <div className="w-full max-w-4xl mx-auto">
                 <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">Global Rate Submission</h1>
                    <p className="text-gray-200 mt-2 text-lg drop-shadow-md">A seamless portal for our valued shipping partners.</p>
                </div>
                
                {step === 1 && renderFormStep()}
                {step === 2 && renderReviewStep()}
                {step === 3 && renderSuccessStep()}
            </div>
        </div>
    );
}