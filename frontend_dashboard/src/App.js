import React from 'react';
import FraudDetectionApp from './components/FraudDetectionApp';
import CreditCardFraudDashboard from './components/CreditCardFraudDashboard';
//import ModelComparisonChart from './components/ModelComparisonChart';
import './App.css';

function App() {
  return (
    <div className="App">
      <FraudDetectionApp />
      <div className="mt-8"></div>
      <CreditCardFraudDashboard />
      <div className="mt-8"></div>
    </div>
  );
}

export default App;