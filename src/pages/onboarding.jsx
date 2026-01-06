import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom'; // <--- Import this
import { Sparkles } from 'lucide-react';
const OnboardingCard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    experience: '',
    productStatus: '',
    storeName: ''
  });

  // Total dots (3 questions + 1 final completion step = 4 dots)
  const totalSteps = 4;

  const handleSelection = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Auto-advance after selection for a smooth flow
    if (step < 3) {
      setTimeout(() => setStep(step + 1), 200); 
    } else {
      setStep(step + 1); // Move to final dot
    }
  };

  const handleSkip = () => {
    console.log("Skipping to builder...");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      
      {/* CARD CONTAINER: Fixed Dimensions 796px x 375px */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center justify-between py-8 px-12"
        style={{ width: '796px', height: '375px' }}
      >

        {/* --- TOP: STEPPER DOTS --- */}
        <div className="flex space-x-3 mb-6">
          {[1, 2, 3, 4].map((dotIndex) => (
            <div
              key={dotIndex}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                step === dotIndex ? 'bg-black' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* --- MIDDLE: DYNAMIC CONTENT --- */}
        <div className="w-full max-w-lg flex-grow flex flex-col justify-center">
          
          {/* QUESTION 1 */}
          {step === 1 && (
            <div className="animate-fade-in text-center">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Do you have experience with selling online?</h2>
              <div className="flex justify-center gap-4">
                <OptionButton 
                  label="Yes" 
                  onClick={() => handleSelection('experience', 'Yes')} 
                  selected={formData.experience === 'Yes'}
                />
                <OptionButton 
                  label="No" 
                  onClick={() => handleSelection('experience', 'No')} 
                  selected={formData.experience === 'No'}
                />
              </div>
            </div>
          )}

          {/* QUESTION 2 */}
          {step === 2 && (
            <div className="animate-fade-in text-center">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Do you know what you are going to sell?</h2>
              <div className="flex flex-col gap-3 items-center">
                <OptionButton 
                  label="Yes" 
                  onClick={() => handleSelection('productStatus', 'Yes')} 
                  wide
                />
                <OptionButton 
                  label="No, still exploring" 
                  onClick={() => handleSelection('productStatus', 'No, still exploring')} 
                  wide
                />
                 <OptionButton 
                  label="No, but I have direction" 
                  onClick={() => handleSelection('productStatus', 'No, but I have direction')} 
                  wide
                />
              </div>
            </div>
          )}

          {/* QUESTION 3 */}
          {step === 3 && (
            <div className="animate-fade-in w-full text-center">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">What are you going to call your store?</h2>
              
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="e.g. Urban Threads"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelection('storeName', formData.storeName)}
                />
                
                {/* AI BUTTON */}
                <button 
                  className="absolute right-2 top-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:text-purple-900 text-xs font-medium px-3 py-2 rounded-md flex items-center gap-1.5 transition-colors border border-purple-200"
                  onClick={() => console.log("Trigger AI Suggestion")}
                >
                  <Sparkles size={12} />
                  Let AI help me
                </button>
              </div>
              
              <button 
                onClick={() => handleSelection('storeName', formData.storeName)}
                className="mt-4 bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          )}

          {/* COMPLETED STATE (Step 4) */}
          {step === 4 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">You are all set!</h2>
              <p className="text-gray-500">Preparing your store environment...</p>
            </div>
          )}
        </div>

        {/* --- BOTTOM: SKIP SECTION --- */}
        <div className="mt-auto text-center">
          <button 
            onClick={handleSkip}
            className="text-gray-500 hover:text-black font-medium text-sm transition-colors"
          >
            Skip
          </button>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
            Straight to building
          </p>
        </div>

      </div>
    </div>
  );
};

// Sub-component for options to keep code clean
const OptionButton = ({ label, onClick, wide = false, selected = false }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 border rounded-lg px-4 py-2 hover:border-black hover:bg-gray-50 transition-all group
      ${wide ? 'w-80 text-left' : 'min-w-[100px] justify-center'}
      ${selected ? 'border-black bg-gray-50' : 'border-gray-200'}
    `}
  >
    {/* Custom Checkbox Visual */}
    <div className={`
      w-4 h-4 rounded border flex items-center justify-center
      ${selected ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}
    `}>
      {selected && <div className="w-2 h-2 bg-white rounded-[1px]" />}
    </div>
    
    <span className="text-sm font-medium text-gray-700 group-hover:text-black">
      {label}
    </span>
  </button>
);

export default OnboardingCard;