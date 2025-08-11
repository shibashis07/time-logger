import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "firebase/firestore";
import "./App.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#E74C3C"];

function App() {
  const [activity, setActivity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activities, setActivities] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);

  // Fetch today's logs on mount
  useEffect(() => {
    fetchActivities();
  }, [today]);

  const fetchActivities = async () => {
    const q = query(collection(db, "activities"), where("date", "==", today));
    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    setActivities(logs);
  };

  const addActivity = async () => {
    if (!activity || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }

    const start = new Date(`${today}T${startTime}`);
    const end = new Date(`${today}T${endTime}`);
    const duration = (end - start) / (1000 * 60); // minutes

    if (duration <= 0) {
      alert("End time must be after start time");
      return;
    }

    const newActivity = {
      activity,
      startTime,
      endTime,
      duration,
      date: today,
    };

    await addDoc(collection(db, "activities"), newActivity);
    setActivity("");
    setStartTime("");
    setEndTime("");
    fetchActivities();
  };

  const deleteActivity = async (id) => {
    await deleteDoc(doc(db, "activities", id));
    fetchActivities();
  };

  const pieData = activities.map((a) => ({
    name: a.activity,
    value: a.duration,
  }));

  return (
    <div className="App">
      <h1>Time Logging App</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Activity"
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
        <button onClick={addActivity}>Add Activity</button>
      </div>

      <h2>Today's Activities ({today})</h2>
      <ul>
        {activities.map((a) => (
          <li key={a.id}>
            {a.activity} — {a.startTime} to {a.endTime} ({a.duration} min)
            <button onClick={() => deleteActivity(a.id)}>❌</button>
          </li>
        ))}
      </ul>

      {pieData.length > 0 && (
        <>
          <h2>Activity Breakdown</h2>
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
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

export default App;
