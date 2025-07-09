// src/components/rate-form/RateEntryRow.jsx

import React from 'react';

// Icons can be defined here or imported from a separate file
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#005f73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.255 15.255L20.745 8.745M3.255 8.745L20.745 15.255" /></svg>);
const PriceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#005f73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M12 2.25v.01M12 19.5v.01M4.5 12h.01M19.5 12h.01M6.343 17.657l.01-.01M17.657 6.343l-.01.01" /></svg>);
const CalendarClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#005f73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 15.75h.008v.008H12v-.008z" /></svg>);


const RateEntryRow = ({ rate, index, onRateChange, onCountryChange, onRemoveRow, countryPortData, isOnlyRow }) => {
    return (
        <div className="p-6 bg-white/80 font-noto-serif backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 space-y-5 relative">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">Rate Entry #{index + 1}</h3>
                {!isOnlyRow && (
                    <button type="button" onClick={() => onRemoveRow(index)} className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-md transition">
                        Remove
                    </button>
                )}
            </div>

            {/* Section 1: Route */}
            <div className="p-4 bg-white/50 font-noto-serif rounded-lg border border-gray-200">
                <div className="flex items-center mb-3"><GlobeIcon /><h4 className="text-md font-bold text-gray-700">Route Selection</h4></div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                    <select name="polCountry" value={rate.polCountry} onChange={(e) => onCountryChange(index, e, 'pol')} required className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]">
                        <option value="">-- Select POL Country --</option>
                        {Object.keys(countryPortData).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="polPort" value={rate.polPort} onChange={(e) => onRateChange(index, e)} required disabled={!rate.polCountry} className="w-full p-2.5 bg-gray-50/70 border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-200">
                        <option value="">-- Select POL Port --</option>
                        {rate.availablePolPorts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="podCountry" value={rate.podCountry} onChange={(e) => onCountryChange(index, e, 'pod')} required className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]">
                         <option value="">-- Select POD Country --</option>
                        {Object.keys(countryPortData).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <select name="podPort" value={rate.podPort} onChange={(e) => onRateChange(index, e)} required disabled={!rate.podCountry} className="w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6] disabled:bg-gray-200">
                         <option value="">-- Select POD Port --</option>
                        {rate.availablePodPorts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {/* Section 2: Rates */}
            <div className="p-4 bg-white/50 font-noto-serif rounded-lg border border-gray-200">
                 <div className="flex items-center mb-3"><PriceIcon /><h4 className="text-md font-bold text-gray-700">Container Rates (USD)</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="number" name="price20gp" value={rate.price20gp} onChange={(e) => onRateChange(index, e)} required placeholder="Price 20GP" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                    <input type="number" name="price40gp" value={rate.price40gp} onChange={(e) => onRateChange(index, e)} required placeholder="Price 40GP" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                    <input type="number" name="price40hq" value={rate.price40hq} onChange={(e) => onRateChange(index, e)} required placeholder="Price 40HQ" className="p-2.5 bg-gray-50/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                </div>
            </div>

            {/* Section 3: Details */}
            <div className="p-4 bg-white/50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-7"><CalendarClockIcon /><h4 className="text-md font-bold text-gray-700">Logistics Details</h4></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative w-full">
  <input
    type="date"
    name="validity"
    value={rate.validity}
    onChange={(e) => onRateChange(index, e)}
    required
    min={new Date().toISOString().split("T")[0]} // disables old dates
    className="peer w-full p-2.5 bg-gray-50/70 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6] [color-scheme:light] placeholder-transparent"
    placeholder="Validity"
  />
  <label
    htmlFor="validity"
    className="absolute left-3 -top-6 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#0077b6]"
  >
    Validity
  </label>
</div>

                    <input type="number" name="transitDays" value={rate.transitDays} onChange={(e) => onRateChange(index, e)} required placeholder="Transit Days" className="w-full p-2.5 bg-gray-50/70 border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                    <input type="number" name="daysFree" value={rate.daysFree} onChange={(e) => onRateChange(index, e)} required placeholder="Days Free" className="w-full p-2.5 bg-gray-50/70 border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0077b6]" />
                </div>
            </div>
        </div>
    );
};

export default RateEntryRow;