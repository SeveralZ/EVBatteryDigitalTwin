import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const API_URL = 'https://ccz88tuk3wv-496ff2e9c6d22116-6085-colab.googleusercontent.com/'; 


const parameterConfig = {
  Cell_Voltage: { min: 3.2, max: 4.2, step: 0.1, unit: 'V' },
  Cell_Impedance: { min: 0.5, max: 2.0, step: 0.1, unit: 'Ω' },
  Cell_Capacity: { min: 2000, max: 5000, step: 100, unit: 'mAh' },
  Compression_Force: { min: 500, max: 2000, step: 50, unit: 'N' },
  Welding_Current: { min: 100, max: 300, step: 10, unit: 'A' },
  Welding_Time: { min: 0.1, max: 1.0, step: 0.1, unit: 's' },
  Torque: { min: 5, max: 15, step: 0.5, unit: 'Nm' },
  Assembly_Time: { min: 10, max: 30, step: 1, unit: 'min' },
  Leakage_Rate: { min: 0, max: 0.1, step: 0.01, unit: 'cm³/min' },
};

const EVModuleAssemblyAnalyzer = () => {
  const [inputs, setInputs] = useState({
    Cell_Voltage: 3.7,
    Cell_Impedance: 1.0,
    Cell_Capacity: 3500,
    Compression_Force: 1000,
    Welding_Current: 200,
    Welding_Time: 0.5,
    Torque: 10,
    Assembly_Time: 20,
    Leakage_Rate: 0.05,
  });

  const [selectedMode, setSelectedMode] = useState('whatIf');
  const [graphData, setGraphData] = useState(null);
  const [output, setOutput] = useState(null);
  const [optimizeParam, setOptimizeParam] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  };

  const handleOptimizeChange = (e) => {
    setOptimizeParam(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedMode === 'optimizer') {
        const response = await fetch(`${API_URL}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_feature: optimizeParam, constraints: inputs }),
        });
        const data = await response.json();
        setOutput(data);
      } else if (selectedMode === 'whatIf') {
        const response = await fetch(`${API_URL}/what_if`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
        });
        const data = await response.json();
        setGraphData(data);
      }
    } catch (error) {
      console.error('Error:', error);
      // You might want to set an error state here and display it to the user
    } finally {
      setLoading(false);
    }
  };

  const graphLabels = ['No Defect', 'Minor Defect', 'Major Defect', 'Critical Defect', 'Efficiency'];
  const chartData = {
    labels: graphLabels,
    datasets: [
      {
        label: 'What-If Scenario',
        data: graphData ? [
          graphData.defect_probability.No_Defect,
          graphData.defect_probability.Minor_Defect,
          graphData.defect_probability.Major_Defect,
          graphData.defect_probability.Critical_Defect,
          graphData.efficiency_score
        ] : [0, 0, 0, 0, 0],
        backgroundColor: ['#00ff00', '#ffff00', '#ff0000', '#ff00ff', '#00bfff'],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mt-5" style={{ paddingTop: '60px', backgroundColor: '#000000', color: '#00ff00' }}>
      <h1 className="mb-4" style={{ fontSize: '1.5rem', maxWidth: '90%' }}>EV Module Assembly Analyzer</h1>
      <div style={{ backgroundColor: '#1a1a1a', color: '#00ff00', padding: '20px', borderRadius: '5px' }}>
        <div className="mb-3">
          <button
            onClick={() => setSelectedMode('whatIf')}
            style={{
              backgroundColor: selectedMode === 'whatIf' ? '#00ff00' : '#1a1a1a',
              color: selectedMode === 'whatIf' ? '#000000' : '#00ff00',
              border: '1px solid #00ff00',
              padding: '10px',
              marginRight: '10px',
            }}
          >
            What-If
          </button>
          <button
            onClick={() => setSelectedMode('optimizer')}
            style={{
              backgroundColor: selectedMode === 'optimizer' ? '#00ff00' : '#1a1a1a',
              color: selectedMode === 'optimizer' ? '#000000' : '#00ff00',
              border: '1px solid #00ff00',
              padding: '10px',
            }}
          >
            Optimizer
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {selectedMode === 'whatIf' && (
            <>
              {Object.keys(inputs).map((key) => (
                <div key={key} className="mb-3">
                  <label htmlFor={key} className="form-label">
                    {key.replace(/_/g, ' ')}:
                    <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                      {inputs[key]} {parameterConfig[key].unit}
                    </span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    id={key}
                    name={key}
                    min={parameterConfig[key].min}
                    max={parameterConfig[key].max}
                    step={parameterConfig[key].step}
                    value={inputs[key]}
                    onChange={handleChange}
                  />
                </div>
              ))}
              {graphData && (
                <div style={{ marginBottom: '20px', height: '300px' }}>
                  <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
              )}
            </>
          )}

          {selectedMode === 'optimizer' && (
            <>
              <div className="mb-3">
                <label htmlFor="optimizeParam" className="form-label">Select Parameter to Optimize:</label>
                <select
                  id="optimizeParam"
                  className="form-select"
                  value={optimizeParam}
                  onChange={handleOptimizeChange}
                  style={{ backgroundColor: '#1a1a1a', color: '#00ff00', border: '1px solid #00ff00' }}
                >
                  <option value="">Select a parameter</option>
                  {Object.keys(inputs).map((key) => (
                    <option key={key} value={key}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              {Object.keys(inputs).map(
                (key) =>
                  key !== optimizeParam && (
                    <div key={key} className="mb-3">
                      <label htmlFor={key} className="form-label">
                        {key.replace(/_/g, ' ')}:
                        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                          {inputs[key]} {parameterConfig[key].unit}
                        </span>
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        id={key}
                        name={key}
                        min={parameterConfig[key].min}
                        max={parameterConfig[key].max}
                        step={parameterConfig[key].step}
                        value={inputs[key]}
                        onChange={handleChange}
                      />
                    </div>
                  )
              )}
              {output && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#000000', borderRadius: '4px', border: '1px solid #00ff00' }}>
                  <p style={{ textAlign: 'center', color: '#ffffff' }}>Optimal Value: {output.optimal_value.toFixed(2)}</p>
                  <p style={{ textAlign: 'center', color: '#ffffff' }}>
                    Predicted Outcome: Efficiency - {output.predicted_outcome.efficiency_score.toFixed(2)},
                    No Defect Probability - {output.predicted_outcome.defect_probability.No_Defect.toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            style={{
              backgroundColor: '#00ff00',
              color: '#000000',
              border: 'none',
              padding: '10px 20px',
              width: '100%',
              marginTop: '20px',
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatIfScenario;