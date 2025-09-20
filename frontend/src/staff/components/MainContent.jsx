import '../styles/MainContent.css';
import { FaMapMarkerAlt } from "react-icons/fa";

export default function MainContent(){
    return(
        <div className="main-container">
            <div className="form-wrapper">
             
                
                <form className="ride-form">
                    <div className='form-group'>
                        <label className="form-label">Passenger's Full Name</label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="Enter full name"
                        />
                    </div>
                    
                    <div className='form-group'>
                        <label className="form-label">Phone Number</label>
                        <input 
                            type="tel" 
                            className="form-input"
                            placeholder="Enter phone number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <div className="location-group">
                            <div className="input-wrapper">
                                <FaMapMarkerAlt className="input-icon" />
                                <input 
                                    type="text" 
                                    className="form-input location-input"
                                    placeholder="From (pickup location)"
                                />
                            </div>
                            <div className="input-wrapper">
                                <FaMapMarkerAlt className="input-icon" />
                                <input 
                                    type="text" 
                                    className="form-input location-input"
                                    placeholder="To (destination)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className="form-label">Ride Type</label>
                        <div className="button-group">
                            <button type="button" className='vip btn-primary'>VIP</button>
                            <button type="button" className='normal btn-secondary'>Normal</button>
                        </div>
                    </div>

                    <button type="submit" className='confirm-btn'>Confirm Ride</button>
                </form>
            </div>
        </div>
    );
}