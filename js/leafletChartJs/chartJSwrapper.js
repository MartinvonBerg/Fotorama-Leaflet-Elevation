/*!
  Wrapper for chartJs 0.17.0
  license: GPL 2.0
  Martin von Berg
*/
// source: https://react-chartjs-2.js.org/examples/line-chart

import {
    Chart as ChartJS,
    //CategoryScale,
    LinearScale,
    Filler,
    PointElement,
    LineController,
    LineElement,
    Title,
    Tooltip,
    //Legend,
  } from 'chart.js';
  
  ChartJS.register(
    //CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    LineElement,
    LineController,
    Title,
    Tooltip,
    //Legend
  );

export {ChartJS};