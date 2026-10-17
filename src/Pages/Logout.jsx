import "react";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    signOut(auth).finally(() => {
      navigate("/templates", { replace: true });
    });
  }, [navigate]);

  return <div></div>;
};

export default Logout;
