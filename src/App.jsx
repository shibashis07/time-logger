import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import "./App.css";

function App() {
  const [activity, setActivity] = useState("");
  const [log, setLog] = useState([]);

  // Load activities from Firestore
  useEffect(() => {
    const fetchActivities = async () => {
      const querySnapshot = await getDocs(collection(db, "activities"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLog(data);
    };

    fetchActivities();
  }, []);

  // Add activity to Firestore
  const handleAddActivity = async () => {
    if (activity.trim() === "") return;

    const newActivity = {
      text: activity,
      timestamp: new Date().toISOString()
    };

    await addDoc(collection(db, "activities"), newActivity);
    setLog([...log, newActivity]);
    setActivity("");
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      ["Activity", "Timestamp"],
      ...log.map(entry => [entry.text, entry.timestamp])
    ];

    const csvContent = csvRows
      .map(row => row.map(item => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "activity_log.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="App">
      <h1>Activity Logger</h1>

      <div className="input-section">
        <input
          type="text"
          value={activity}
          placeholder="Enter activity"
          onChange={(e) => setActivity(e.target.value)}
        />
        <button onClick={handleAddActivity}>Add</button>
      </div>

      <div className="log-section">
        <h2>Log</h2>
        <ul>
          {log.map((entry, index) => (
            <li key={entry.id || index}>
              {entry.text} - {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={exportToCSV}>Export to CSV</button>
    </div>
  );
}

export default App;
