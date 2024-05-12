import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UseNavigator({ setIsLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout operation here
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  }, [navigate, setIsLoggedIn]);

  return null; // This component does not render anything
}

export default UseNavigator;
