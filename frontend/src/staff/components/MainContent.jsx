import '../styles/MainContent.css';
import { FaMapMarkerAlt, FaUser, FaPhone, FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getDashboardStats, getRecentRides, createUser } from '../services/api';

export default function MainContent() {
    const [rideType, setRideType] = useState("vip");
    const [activeTab, setActiveTab] = useState("book");
    const [stats, setStats] = useState([
        { title: "Total Revenue", value: 0, icon:<FaMoneyBillWave />, change: "" },
        { title: "Active Drivers", value: 0, icon: <FaUser />, change: "" },
        { title: "Total Passengers", value: 0, icon: <FaUser />, change: "" },
        { title: "Daily Revenue", value: 0, icon: <FaMoneyBillWave />, change: "" }
    ]);

    // form state
    const [form, setForm] = useState({
        name: "",
        phone: "",
        pickup: "",
        destination: "",
        rideType: "vip",
    });

    const [step, setStep] = useState("form"); // "form" | "request" | "result"
    const [userToken, setUserToken] = useState(null);
    const [socket, setSocket] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    // Stats
    const fetchStats = async () => {
        const data = await getDashboardStats();
        setStats([
            { title: "Total Revenue", value: data.totalRevenue, icon:<FaMoneyBillWave />, change: "" },
            { title: "Active Drivers", value: data.activeDrivers, icon: <FaUser />, change: "" },
            { title: "Total Passengers", value: data.totalPassengers, icon: <FaUser />, change: "" },
            { title: "Daily Revenue", value: data.dailyRevenue, icon: <FaMoneyBillWave />, change: "" }
        ]);
    };

    // Recent Rides
    const [recentRides, setRecentRides] = useState([]);
    const fetchRecentRides = async () => {
        const data = await getRecentRides();
        setRecentRides(data);
    };

    useEffect(() => {
        fetchStats();
        fetchRecentRides();
        const interval = setInterval(() => {
            fetchStats();
            fetchRecentRides();
        }, 300000);
        return () => clearInterval(interval);
    }, []);

    // handle form change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // confirm ride (create user)
    const handleConfirmRide = async (e) => {
        e.preventDefault();
        const res = await createUser({
            name: form.name,
            phone: form.phone,
            source: form.pickup
        });
        if (res.success) {
            setUserToken(res.token);
            setStep("request");
        } else {
            alert(res.message);
        }
    };

    // search for driver (socket.io)
    const handleSearchDriver = () => {
        const newSocket = io("http://localhost:5000"); // backend socket server
        setSocket(newSocket);

        setStatusMessage("Searching for drivers...");

        newSocket.emit("rideRequest", {
            name: form.name,
            phone: form.phone,
            pickup: form.pickup,
            destination: form.destination,
            rideType: form.rideType,
        });

        newSocket.on("rideResponse", (data) => {
            if (data.status === "accepted") {
                setStatusMessage("Driver accepted! Ride booked successfully.");
                newSocket.disconnect();
                setStep("result");
            } else {
                setStatusMessage(data.message || "No driver available.");
            }
        });
    };

    const handleRetry = () => {
        if (socket) socket.disconnect();
        handleSearchDriver();
    };

    const handleCancel = () => {
        if (socket) socket.disconnect();
        setSocket(null);
        setStep("form");
        setStatusMessage("");
    };

    return(
        <div className="main-container">
            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                        </div>
                        <div className="stat-change">{stat.change}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="content-tabs">
                <button 
                    className={activeTab === "book" ? "tab-active" : ""}
                    onClick={() => setActiveTab("book")}
                >Book Ride</button>
                <button 
                    className={activeTab === "recent" ? "tab-active" : ""}
                    onClick={() => setActiveTab("recent")}
                >Recent Rides</button>
            </div>

            {/* Book Ride */}
            {activeTab === "book" ? (
                <div className="form-wrapper">
                    {step === "form" && (
                        <>
                        <h2>Book a New Ride</h2>
                        <form className="ride-form" onSubmit={handleConfirmRide}>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label className="form-label"><FaUser className="label-icon" />Passenger's Full Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Enter full name" />
                                </div>
                                <div className='form-group'>
                                    <label className="form-label"><FaPhone className="label-icon" />Phone Number</label>
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="Enter phone number" />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label"><FaMapMarkerAlt className="label-icon" />Pickup Location</label>
                                <input type="text" name="pickup" value={form.pickup} onChange={handleChange} className="form-input location-input" placeholder="Enter pickup location" />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label"><FaMapMarkerAlt className="label-icon" />Destination</label>
                                <input type="text" name="destination" value={form.destination} onChange={handleChange} className="form-input location-input" placeholder="Enter destination" />
                            </div>
                            <div className='form-group full-width'>
                                <label className="form-label">Ride Type</label>
                                <div className="button-group">
                                    <button type="button" className={`ride-type-btn ${form.rideType === "vip" ? "active" : ""}`} onClick={() => setForm({ ...form, rideType: "vip" })}>VIP</button>
                                    <button type="button" className={`ride-type-btn ${form.rideType === "normal" ? "active" : ""}`} onClick={() => setForm({ ...form, rideType: "normal" })}>Normal</button>
                                </div>
                            </div>
                            <button type="submit" className='confirm-btn'>Confirm Ride</button>
                        </form>
                        </>
                    )}

                    {step === "request" && (
                        <div className="ride-request-screen">
                            <h2>Ride Request</h2>
                            <p><strong>Name:</strong> {form.name}</p>
                            <p><strong>Phone:</strong> {form.phone}</p>
                            <p><strong>Pickup:</strong> {form.pickup}</p>
                            <p><strong>Destination:</strong> {form.destination}</p>
                            <p><strong>Ride Type:</strong> {form.rideType}</p>
                            <button onClick={handleSearchDriver}>Search Driver</button>
                            <button onClick={handleCancel}>Cancel</button>
                            <p>{statusMessage}</p>
                        </div>
                    )}

                    {step === "result" && (
                        <div className="ride-result-screen">
                            <h2>{statusMessage}</h2>
                            <button onClick={handleCancel}>Close</button>
                        </div>
                    )}

                    {statusMessage && step === "request" && (
                        <div className="retry-section">
                            <button onClick={handleRetry}>Retry</button>
                            <button onClick={handleCancel}>Cancel</button>
                        </div>
                    )}
                </div>
            ) : (
                // Recent rides
                <div className="recent-rides">
                    <h2>Recent Rides</h2>
                    <div className="rides-list">
                        {recentRides.map(ride => (
                            <div key={ride.id} className="ride-card">
                                <div className="ride-info">
                                    <h4>{ride.passenger}</h4>
                                    <div className="ride-route">
                                        <span>{ride.pickup}</span>
                                        <span className="route-arrow">→</span>
                                        <span>{ride.destination}</span>
                                    </div>
                                    <div className="ride-time">{ride.time}</div>
                                </div>
                                <div className={`ride-status ${ride.status.toLowerCase().replace(' ', '-')}`}>{ride.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
