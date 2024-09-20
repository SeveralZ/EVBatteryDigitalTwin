import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Button, Tabs, Tab } from 'react-bootstrap';
import { AlertCircle, TrendingUp, Activity } from "lucide-react";

const API_URL = 'https://ccz88tuk3wv-496ff2e9c6d22116-6085-colab.googleusercontent.com/'; 

const Analytics = () => {
  const [data, setData] = useState(null);
  const [key, setKey] = useState('performance');
  const [activeButton, setActiveButton] = useState('performance');
  const [errorData, setErrorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Add any necessary parameters here
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
        setErrorData(result.errors || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Fetch new data every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const renderPerformanceMetrics = () => {
    if (!data) return null;

    const metrics = {
      defect_accuracy: data.defect_accuracy,
      efficiency_r2: data.efficiency_r2,
      efficiency_mse: data.efficiency_mse
    };

    return (
      <div className="row mb-4">
        <div className="col-md-4">
          <Card style={{ backgroundColor: '#1a1a1a', color: '#00ff00' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6>Defect Accuracy</h6>
              <AlertCircle className="text-accent" />
            </Card.Header>
            <Card.Body>
              <h4>{(metrics.defect_accuracy * 100).toFixed(2)}%</h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card style={{ backgroundColor: '#1a1a1a', color: '#00ff00' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6>Efficiency R²</h6>
              <TrendingUp className="text-accent" />
            </Card.Header>
            <Card.Body>
              <h4>{metrics.efficiency_r2.toFixed(4)}</h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card style={{ backgroundColor: '#1a1a1a', color: '#00ff00' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6>Efficiency MSE</h6>
              <Activity className="text-accent" />
            </Card.Header>
            <Card.Body>
              <h4>{metrics.efficiency_mse.toFixed(4)}</h4>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  };

  const renderFeatureImportance = () => {
    if (!data || !data.feature_importance) return null;

    return (
      <Card className="mb-4" style={{ backgroundColor: '#1a1a1a', color: '#00ff00' }}>
        <Card.Header>Feature Data</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.feature_importance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" />
              <XAxis type="number" stroke="#00ff00" />
              <YAxis dataKey="feature" type="category" width={150} stroke="#00ff00" />
              <Tooltip />
              <Bar dataKey="importance" fill="#4caf50" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    );
  };

  const renderErrors = () => (
    <Card className="mb-4" style={{ backgroundColor: '#1a1a1a', color: '#00ff00' }}>
      <Card.Header>Detected Errors and Suggested Improvements</Card.Header>
      <Card.Body>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {errorData.map((error, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>• {error}</li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );

  const handleButtonClick = (key) => {
    setKey(key);
    setActiveButton(key);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5" style={{ paddingTop: '60px', backgroundColor: '#000000', color: '#00ff00' }}>
      <h1 className="mb-4" style={{ fontSize: '1.5rem', maxWidth: '90%' }}>EV Module Assembly Analysis Dashboard</h1>
      <Tabs activeKey={key} onSelect={handleButtonClick} className="mb-3">
        <Tab eventKey="performance" title={<Button variant="link" style={{ color: activeButton === 'performance' ? '#000000' : '#00ff00' }}>Performance</Button>}>
          {key === 'performance' && renderPerformanceMetrics()}
        </Tab>
        <Tab eventKey="features" title={<Button variant="link" style={{ color: activeButton === 'features' ? '#000000' : '#00ff00' }}>Features</Button>}>
          {key === 'features' && renderFeatureImportance()}
        </Tab>
        <Tab eventKey="errors" title={<Button variant="link" style={{ color: activeButton === 'errors' ? '#000000' : '#00ff00' }}>Errors</Button>}>
          {key === 'errors' && renderErrors()}
        </Tab>
      </Tabs>
    </div>
  );
};

export default Analytics;