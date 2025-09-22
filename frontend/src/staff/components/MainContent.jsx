import '../styles/MainContent.css';
import { FaMapMarkerAlt, FaUser, FaPhone, FaCar, FaClock, FaMoneyBillWave } from "react-icons/fa";
import { useState } from "react";

export default function MainContent(){
    const [rideType, setRideType] = useState("vip");
    const [activeTab, setActiveTab] = useState("book");
    
    // Sample data for dashboard stats
    const stats = [
        { title: "Total Revenue", value: "24", icon:<FaMoneyBillWave />, change: "+12%" },
        { title: "Active Drivers", value: "8", icon: <FaUser />, change: "+2" },
        { title: "Passenger", value: "7min", icon: <FaUser />, change: "-2min" },
        { title: "Revenue", value: "$428", icon: <FaMoneyBillWave />, change: "+18%" }
    ];
    
    // Sample recent rides
    const recentRides = [
        { id: 1, passenger: "Sarah Johnson", pickup: "Downtown", destination: "Airport", time: "12:30 PM", status: "Completed" },
        { id: 2, passenger: "Michael Chen", pickup: "University", destination: "City Center", time: "1:15 PM", status: "In Progress" },
        { id: 3, passenger: "Emma Wilson", pickup: "Railway Station", destination: "Business District", time: "2:45 PM", status: "Scheduled" }
    ];
    
    return(
        <div className="main-container">
                <div className="date-display">Wednesday, March 15, 2023</div>
            
            {/* Stats Overview */}
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
            
            <div className="content-tabs">
                <button 
                    className={activeTab === "book" ? "tab-active" : ""}
                    onClick={() => setActiveTab("book")}
                >
                    Book Ride
                </button>
                <button 
                    className={activeTab === "recent" ? "tab-active" : ""}
                    onClick={() => setActiveTab("recent")}
                >
                    Recent Rides
                </button>
            </div>
            
            {activeTab === "book" ? (
                <div className="form-wrapper">
                    <h2>Book a New Ride</h2>
                    
                    <form className="ride-form">
                        <div className='form-row'>
                            <div className='form-group'>
                                <label className="form-label">
                                    <FaUser className="label-icon" />
                                    Passenger's Full Name
                                </label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div className='form-group'>
                                <label className="form-label">
                                    <FaPhone className="label-icon" />
                                     Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    className="form-input"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group full-width">
                            <label className="form-label">
                                <FaMapMarkerAlt className="label-icon" />
                                Pickup Location
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    className="form-input location-input"
                                    placeholder="Enter pickup location"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group full-width">
                            <label className="form-label">
                                <FaMapMarkerAlt className="label-icon" />
                                Destination
                            </label>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    className="form-input location-input"
                                    placeholder="Enter destination"
                                />
                            </div>
                        </div>

                        <div className='form-group full-width'>
                            <label className="form-label">Ride Type</label>
                            <div className="button-group">
                                <button 
                                    type="button" 
                                    className={`ride-type-btn ${rideType === "vip" ? "active" : ""}`}
                                    onClick={() => setRideType("vip")}
                                >
                                    VIP
                                </button>
                                <button 
                                    type="button" 
                                    className={`ride-type-btn ${rideType === "normal" ? "active" : ""}`}
                                    onClick={() => setRideType("normal")}
                                >
                                    Normal
                                </button>
                            </div>
                        </div>

                        <button type="submit" className='confirm-btn'>Confirm Ride</button>
                    </form>
                </div>
            ) : (
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
                                <div className={`ride-status ${ride.status.toLowerCase().replace(' ', '-')}`}>
                                    {ride.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}