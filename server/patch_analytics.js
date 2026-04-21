const fs = require('fs');

const path = '../client/src/pages/AnalyticsDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

// For AreaChart
code = code.replace(
  /<AreaChart([^>]*)>/g,
  '<AreaChart$1>\n                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />\n                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} domain={[0, 100]} />'
);

// For BarChart
code = code.replace(
  /<BarChart([^>]*)>/g,
  '<BarChart$1>\n                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />\n                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} />'
);

// We need to add CartesianGrid and YAxis to imports
if (!code.includes('CartesianGrid')) {
  code = code.replace(
    /import \{([^}]+)\} from 'recharts';/g,
    'import { $1, CartesianGrid, YAxis } from "recharts";'
  );
}

fs.writeFileSync(path, code, 'utf8');
