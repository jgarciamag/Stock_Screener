import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { csvParse } from 'd3-dsv';

const Heatmap = ({ selectedDate, selectedMaturity }) => {
  const [data, setData] = useState([]);
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const transformRef = useRef(d3.zoomIdentity); // Use a ref to store the transform state

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!selectedMaturity || !selectedDate) return;

    let fileName = '';
    if (selectedMaturity === 'Daily') fileName = '/daily_stock_changes.csv';
    else if (selectedMaturity === 'Monthly') fileName = '/monthly_stock_changes.csv';
    else if (selectedMaturity === 'Annual') fileName = '/annual_stock_changes.csv';

    console.log(`Loading stock changes from ${fileName}`);
    fetch(fileName)
      .then(response => response.text())
      .then(text => {
        const stockChanges = csvParse(text);
        console.log('Stock changes data:', stockChanges);

        const dateRow = stockChanges.find(row => row.Date === selectedDate);
        console.log(`Data row for selected date (${selectedDate}):`, dateRow);

        if (!dateRow) {
          console.error(`No data found for selected date: ${selectedDate}`);
          return;
        }

        return dateRow;
      })
      .then(dateRow => {
        if (!dateRow) return;

        fetch('/stock_data.csv')
          .then(response => response.text())
          .then(text => {
            const stockData = csvParse(text);
            stockData.forEach(d => {
              d.Weight = +d.Weight;
              let pctChange = parseFloat(dateRow[d.Ticker]) || 0;
              pctChange *= 100;
              d['Pct Change'] = pctChange;
            });

            const sectorLimit = {
              'Communication Services': 10,
              'Consumer Discretionary': 12,
              'Energy': 8,
              'Utilities': 5,
              'Real Estate': 8,
              'Materials': 8,
              'Industrials': 25,
              'Consumer Staples': 12,
            };

            const groupedData = d3.groups(stockData, d => d['GICS Sector']).map(([key, values]) => ({
              name: key,
              children: values
                .sort((a, b) => b.Weight - a.Weight)
                .slice(0, sectorLimit[key] || 25)
            }));

            const hierarchicalData = {
              name: 'Market',
              children: groupedData.filter(d => d.children.length > 0)
            };

            setData(hierarchicalData);
          });
      });
  }, [selectedDate, selectedMaturity]);

  useEffect(() => {
    if (!data.children) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleLinear()
      .domain([-5, 0, 5])
      .range(['red', 'lightgray', 'green']);

    const treemapLayout = d3.treemap()
      .size([width, height])
      .paddingInner(1)
      .paddingTop(20);

    const root = d3.hierarchy(data)
      .sum(d => d.Weight)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemapLayout(root);

    const nodes = g.selectAll('g')
      .data(root.descendants().filter(d => d.depth !== 1 || d.value > 0))
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d.depth === 1 ? 'black' : colorScale(d.data['Pct Change']))
      .attr('stroke', 'white');

    const legendNode = nodes.filter(d => d.depth === 0);
    legendNode.append('rect')
      .attr('width', width)
      .attr('height', 40)
      .attr('fill', 'black')
      .attr('stroke', 'white');

    legendNode.append('text')
      .attr('x', 5)
      .attr('y', 17)
      .attr('font-size', '1em')
      .attr('fill', 'white')
      .text('S&P 500 Stock Screener');

    nodes.filter(d => d.depth === 1).append('text')
      .attr('x', 4)
      .attr('y', 14)
      .attr('font-size', '1em')
      .attr('fill', 'white')
      .text(d => d.data.name);

    nodes.filter(d => d.depth > 1).each(function(d) {
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;
      const fontSizeTicker = Math.min(width / 5, height / 5);
      const fontSizePctChange = fontSizeTicker * 0.8;

      const textGroup = d3.select(this).append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      textGroup.append('text')
        .attr('dy', -fontSizeTicker / 3)
        .attr('font-size', fontSizeTicker)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(d => d.data.Ticker)
        .each(function(d) {
          const bbox = this.getBBox();
          if (bbox.width > (d.x1 - d.x0) - 8) {
            d3.select(this).text('');
          }
        });

      textGroup.append('text')
        .attr('dy', fontSizeTicker / 2)
        .attr('font-size', fontSizePctChange)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(d => {
          const pctChange = parseFloat(d.data['Pct Change']);
          return isNaN(pctChange) ? '' : `${pctChange.toFixed(2)}%`;
        })
        .each(function(d) {
          const bbox = this.getBBox();
          if (bbox.width > (d.x1 - d.x0) - 8) {
            d3.select(this).text('');
          }
        });
    });

    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        transformRef.current = event.transform; // Save the current transform
      });

    svg.call(zoom);

    svg.call(zoom.transform, transformRef.current); // Apply the saved transform
  }, [data, dimensions]);

  return (
    <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
  );
};

export default Heatmap;
