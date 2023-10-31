import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

function ProtectedRpute({ children }) {
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(
    function () {
      if (!isAuth) navigate("/");
    },
    [isAuth, navigate]
  );
  return isAuth ? children : null;
}

export default ProtectedRpute;
