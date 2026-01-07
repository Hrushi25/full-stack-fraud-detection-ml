import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

const FraudDetectionApp = () => {
  const [formData, setFormData] = useState({
    amt: 120.0,
    hour: 14,
    day: 15,
    month: 6,
    dayofweek: 3,
    distance: 25.5,
    city_pop: 250000
  });
  
  
  const [prediction, setPrediction] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featureImportance, setFeatureImportance] = useState([]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };
  
  const predictFraud = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
  
      const data = await res.json();
  
      setRiskScore(data.risk_score);
      setPrediction(data.label === "FRAUD" ? "Fraudulent" : "Legitimate");
  
      // Convert SHAP explanations → UI format
      setFeatureImportance(
        data.explanations.map(e => ({
          name: e.feature,
          value: Math.abs(e.shap_value)   // magnitude = importance
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  
  // For RadialBarChart
  const riskData = riskScore ? [{ name: 'Risk', value: riskScore * 100 }] : [];
  
  
  const getScoreColor = () => {
    if (!riskScore) return '#6B7280'; // gray-500
    if (riskScore < 0.3) return '#10B981'; // green-500
    if (riskScore < 0.7) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };
  
  const getScoreBackground = () => {
    if (!riskScore) return 'bg-gray-100';
    if (riskScore < 0.3) return 'bg-green-50';
    if (riskScore < 0.7) return 'bg-yellow-50';
    return 'bg-red-50';
  };
  
  const getScoreText = () => {
    if (!riskScore) return 'No Data';
    if (riskScore < 0.3) return 'Low Risk';
    if (riskScore < 0.7) return 'Medium Risk';
    return 'High Risk';
  };
  
  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-blue-600 rounded-full p-3 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Credit Card Fraud Detection System</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Transaction Information
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Amount ($)
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amt}
                  onChange={handleInputChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hour of Day (0-23)
                </label>
                <input
                  type="range"
                  name="hour"
                  min="0"
                  max="23"
                  value={formData.hour}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">0:00</span>
                  <span className="text-xs font-medium text-blue-600">{formData.hour}:00</span>
                  <span className="text-xs text-gray-500">23:00</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week (0-6)
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Month (1-31)
                </label>
                <input
                  type="number"
                  name="day"
                  min="1"
                  max="31"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month (1-12)
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer-Merchant Distance (km)
              </label>
              <input
                type="range"
                name="distance"
                min="0"
                max="500"
                step="5"
                value={formData.distance}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">0 km</span>
                <span className="text-xs font-medium text-blue-600">{formData.distance} km</span>
                <span className="text-xs text-gray-500">500 km</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City Population
              </label>
              <select
                name="cityPop"
                value={formData.cityPop}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="10000">Small Town (10,000)</option>
                <option value="50000">Small City (50,000)</option>
                <option value="100000">Medium City (100,000)</option>
                <option value="250000">Large City (250,000)</option>
                <option value="500000">Major City (500,000)</option>
                <option value="1000000">Metro Area (1,000,000+)</option>
              </select>
            </div>
            
            <button
              onClick={predictFraud}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Detect Fraud'}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="text-xs text-gray-500">
              <div className="font-semibold mb-1">Model Information:</div>
              <p>This fraud detection system uses a combination of Random Forest and XGBoost models trained on transaction patterns. Key features include amount, time, distance, and location data.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl shadow">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Analyzing transaction patterns...</p>
              <p className="text-gray-500 text-sm mt-2">Comparing with millions of historical transactions</p>
            </div>
          )}
          
          {!loading && prediction && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl shadow ${getScoreBackground()}`}>
                <div className="flex flex-col md:flex-row items-center">
                  <div className="w-full md:w-1/3 flex flex-col items-center mb-4 md:mb-0">
                    <div className="mb-2 text-gray-600 font-medium">Risk Score</div>
                    <div style={{ width: '120px', height: '120px' }} className="relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="60%" 
                          outerRadius="100%" 
                          barSize={10} 
                          data={riskData} 
                          startAngle={90} 
                          endAngle={-270}
                        >
                          <RadialBar
                            background
                            clockWise
                            dataKey="value"
                            fill={getScoreColor()}
                            cornerRadius={30}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold" style={{ color: getScoreColor() }}>
                          {riskScore ? Math.round(riskScore * 100) : 0}%
                        </span>
                        <span className="text-xs font-medium text-gray-500">{getScoreText()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 md:pl-6 md:border-l border-gray-200">
                    <div className="text-center md:text-left mb-4">
                      <div className="text-gray-600 font-medium mb-1">Transaction Classification</div>
                      <div className={`text-2xl font-bold ${prediction === "Fraudulent" ? "text-red-600" : "text-green-600"}`}>
                        {prediction}
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <div className="text-gray-600 font-medium mb-2">Recommendation:</div>
                      {prediction === "Fraudulent" ? (
                        <div className="text-red-600 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Block transaction and contact cardholder immediately for verification
                        </div>
                      ) : riskScore > 0.3 ? (
                        <div className="text-yellow-600 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Process with caution - flag for post-transaction review
                        </div>
                      ) : (
                        <div className="text-green-600 font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Approve transaction - low risk indicators detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Risk Factors
                  </h3>
                  
                  {riskFactors.length > 0 ? (
                    <ul className="space-y-3">
                      {riskFactors.map((factor, index) => (
                        <li key={index} className="flex">
                          <div className={`flex-shrink-0 w-2 rounded-full self-stretch mr-3 ${
                            factor.impact === 'high' ? 'bg-red-500' : 
                            factor.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="flex items-center">
                              <div className="font-medium">{factor.name}</div>
                              <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                factor.impact === 'high' ? 'bg-red-100 text-red-800' : 
                                factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>{factor.impact}</div>
                            </div>
                            <div className="text-sm text-gray-600">{factor.description}</div>
                            <div className="text-sm font-medium mt-0.5">{typeof factor.value === 'number' && !isNaN(factor.value) ? (factor.value > 1000 ? factor.value.toLocaleString() : factor.value) : factor.value}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No significant risk factors detected
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Feature Importance
                  </h3>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={featureImportance}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 0.3]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !prediction && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-lg text-gray-600 mb-2">Enter transaction details</p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Fill in the transaction information on the left and click "Detect Fraud" to analyze the transaction for potential fraud risk
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudDetectionApp;