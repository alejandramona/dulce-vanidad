import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// AdminOrders ahora es parte del panel Admin unificado
const AdminOrders = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/admin", { replace: true }); }, [navigate]);
  return null;
};

export default AdminOrders;
