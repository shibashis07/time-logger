import React, { useState, useEffect } from "react";
import "./App.css";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import TimeLogger from "./TimeLogger";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [activity, setActivity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);

  await addDoc(collection(db, "users", user.uid, "activities"), {
    activity,
    startTime,
    endTime,
    totalMinutes,
    createdAt: new Date()
  });

  // Load activities from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "activities"), orderBy("startTime", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(data);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Login user={user} />
      {user ? <TimeLogger user={user} /> : <p>Please log in to continue.</p>}
    </div>
  );
}

  const handleAddActivity = async () => {
    if (!activity || !startTime || !endTime) return;

    const totalMinutes =
      (new Date(`1970-01-01T${endTime}:00`) -
        new Date(`1970-01-01T${startTime}:00`)) /
      (1000 * 60);

    const newActivity = {
      activity,
      startTime,
      endTime,
      totalMinutes
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, "activities"), newActivity);

    // Update local state
    setActivities([...activities, { id: docRef.id, ...newActivity }]);

    setActivity("");
    setStartTime("");
    setEndTime("");
  };

  const pieData = {
    labels: activities.map(a => a.activity),
    datasets: [
      {
        data: activities.map(a => a.totalMinutes),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#8A2BE2",
          "#00FA9A"
        ]
      }
    ]
  };

  return (
    <div className="App">
      <h1>Daily Time Logger</h1>

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
      <button onClick={handleAddActivity}>Add Activity</button>

      <ul>
        {activities.map((a) => (
          <li key={a.id}>
            {a.activity} — {a.startTime} to {a.endTime} ({a.totalMinutes} mins)
          </li>
        ))}
      </ul>

      {activities.length > 0 && (
        <div style={{ width: "400px", margin: "auto" }}>
          <Pie data={pieData} />
        </div>
      )}
    </div>
  );
}

export default App;
