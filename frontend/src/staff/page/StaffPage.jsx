import { useState } from "react";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import History from "../components/History";
import Setting from "../components/Setting";
import Sidebar from "../components/Sidebar";
import SignIn from "../components/SignIn";
import '../styles/StaffPage.css';

export default function StaffPage() {
  const [activeComponent, setActiveComponent] = useState("main"); 
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [notifications, setNotifications] = useState(3); // Example notification count

  const handleSetActiveComponent = (component) => {
    console.log("Setting active component to:", component);
    setActiveComponent(component);
    setIsSidebarVisible(false);
  };

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
  };

  return (
    <div className="staff-page">
      {activeComponent !== "signin" && activeComponent !== "signup" && (
        <Header onMenuClick={handleShowSidebar} notifications={notifications} />
      )}
      
      {activeComponent !== "signin" && (
        <Sidebar 
          setActiveComponent={handleSetActiveComponent}
          onVisibilityChange={setIsSidebarVisible}
          isVisible={isSidebarVisible}
          activeComponent={activeComponent}
        />
      )}

      <div className="content-area">
        {activeComponent === "main" && <MainContent />}
        {activeComponent === "history" && <History />}
        {activeComponent === "setting" && <Setting />}
        {activeComponent === "signin" && (
          <SignIn 
            setActiveComponent={setActiveComponent} 
            onVisibilityChange={setIsSidebarVisible} 
            isVisible={isSidebarVisible} 
          />
        )}
        
      </div>
    </div>
  );
}