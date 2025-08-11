import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { format, isToday } from "date-fns";
import "./App.css";

export default function App() {
  const [activity, setActivity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [logs, setLogs] = useState([]);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("timeLogs")) || [];
    const todayLogs = saved.filter(log => isToday(new Date(log.date)));
    setLogs(todayLogs);
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timeLogs", JSON.stringify(logs));
  }, [logs]);

  const addLog = () => {
    if (!activity || !startTime || !endTime) return;

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diff = (end - start) / (1000 * 60); // minutes

    if (diff <= 0) {
      alert("End time must be after start time");
      return;
    }

    const newLog = {
      activity,
      startTime,
      endTime,
      duration: diff,
      date: new Date().toISOString()
    };

    setLogs([...logs, newLog]);
    setActivity("");
    setStartTime("");
    setEndTime("");
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#E67E22"];

  const chartData = logs.reduce((acc, log) => {
    const existing = acc.find(a => a.name === log.activity);
    if (existing) {
      existing.value += log.duration;
    } else {
      acc.push({ name: log.activity, value: log.duration });
    }
    return acc;
  }, []);
  const exportToCSV = () => {
    if (logs.length === 0) return;
  
    const headers = ["Activity", "Start Time", "End Time", "Duration (min)"];
    const rows = logs.map(log => [
      log.activity,
      log.startTime,
      log.endTime,
      log.duration
    ]);
  
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `time_logs_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="app">
      <h1>⏳ Daily Time Logger</h1>
      <p>{format(new Date(), "PPP")}</p>

      <div className="form">
        <input
          type="text"
          placeholder="Activity name"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <button onClick={addLog}>Add Activity</button>
      </div>

      <h2>Today's Activities</h2>
      <button onClick={exportToCSV} style={{ marginBottom: "10px" }}>
     📄 Export to CSV
      </button>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Start</th>
            <th>End</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.activity}</td>
              <td>{log.startTime}</td>
              <td>{log.endTime}</td>
              <td>{log.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length > 0 && (
        <>
          <h2>Activity Breakdown</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={chartData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </>
      )}
    </div>
  );
}
