import "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  // Sign out the user
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      navigate("/");
    })
    .catch((_error) => {
      // An error happened.
    });

  return <div></div>;
};

export default Logout;
