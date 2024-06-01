import React, { useState, useEffect } from 'react';
import Heatmap from './components/Heatmap.jsx';
import Footer from './components/Footer.jsx';
import './styles/App.css';
import Papa from 'papaparse';

function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [dates, setDates] = useState([]);
  const [selectedMaturity, setSelectedMaturity] = useState('Daily'); // State for selected maturity

  useEffect(() => {
    // Fetch and parse dates from the CSV file
    fetch('date_only.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: function(results) {
            const parsedDates = results.data
              .map(row => row.Date.trim())
              .filter(date => date); // Filter out any empty dates
            console.log('Parsed Dates:', parsedDates); // Log parsed dates for debugging
            setDates(parsedDates);
            if (parsedDates.length > 0) {
              setSelectedDate(parsedDates[0]); // Select the first date by default
            }
          },
          error: function(error) {
            console.error('Error parsing CSV:', error);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching dates:', error);
      });
  }, []);

  const handleMaturityClick = (maturity) => {
    setSelectedMaturity(maturity);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Select the maturity</h1>
        <div className="button-container">
          <button 
            className={`square-button ${selectedMaturity === 'Daily' ? 'selected' : ''}`} 
            onClick={() => handleMaturityClick('Daily')}
          >
            Daily
          </button>
          <button 
            className={`square-button ${selectedMaturity === 'Monthly' ? 'selected' : ''}`} 
            onClick={() => handleMaturityClick('Monthly')}
          >
            Monthly
          </button>
          <button 
            className={`square-button ${selectedMaturity === 'Annual' ? 'selected' : ''}`} 
            onClick={() => handleMaturityClick('Annual')}
          >
            Annual
          </button>
        </div>
        <h1>Select date</h1>
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        >
          {dates.map((date, index) => (
            <option key={index} value={date}>{date}</option>
          ))}
        </select>
      </div>
      <div className="heatmap-container">
        <Heatmap selectedDate={selectedDate} selectedMaturity={selectedMaturity} />
        <Footer />
      </div>
    </div>
  );
}

export default App;
