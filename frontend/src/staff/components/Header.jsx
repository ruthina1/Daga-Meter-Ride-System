import avater from '../images/avater.jpg';
import Sidebar from './Sidebar';
import '../styles/header.css';

export default function Header({ onMenuClick }) { 
  return (
    <div className="header">
      <h1>Staff Dashboard</h1>
      <img 
        src={avater}  
        alt="profile" 
        onClick={onMenuClick} 
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}