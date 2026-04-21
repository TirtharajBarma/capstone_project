const fs = require('fs');

const historyPath = 'client/src/pages/HistoryDashboard.jsx';
let code = fs.readFileSync(historyPath, 'utf8');

code = code.replace(
  /\{prediction\.confidencePercentage\}%/g,
  '{parseFloat(prediction.confidencePercentage) > 100 ? parseFloat(prediction.confidencePercentage) / 100 : parseFloat(prediction.confidencePercentage)}%'
);

fs.writeFileSync(historyPath, code, 'utf8');
