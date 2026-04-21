const fs = require('fs');

const dashboardPath = 'client/src/pages/UserDashboard.jsx';
let code = fs.readFileSync(dashboardPath, 'utf8');

code = code.replace(
  /\{Math\.round\(recognition\.confidence \* 100\)\}%/g,
  '{recognition.confidence > 100 ? Math.round(recognition.confidence / 100) : recognition.confidence > 1 ? Math.round(recognition.confidence) : Math.round((recognition.confidence || 0) * 100)}%'
);

code = code.replace(
  /<p className="text-\[12px\] font-medium text-slate-400 mt-1 uppercase tracking-wider">-\<\/p>/g,
  '<p className="text-[12px] font-medium text-slate-400 mt-1 capitalize tracking-wide truncate">{recognition.date ? formatRelativeTime(new Date(recognition.date)) : "Recent Analysis"}</p>'
);

fs.writeFileSync(dashboardPath, code, 'utf8');
