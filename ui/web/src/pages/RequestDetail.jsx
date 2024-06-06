import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";


export default function RequestDetail() {
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const { currentUser, token } = useSelector((state) => state.user);

    const { id } = useParams();

    useEffect(() => {
        const getRequestInfo = async () => {
            try{
                const res = await fetch(
                    `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetail/${id}`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const data = await res.json();
            
                  if (!res.ok) {
                    setPublishError(data.message);
                    return;
                  }
                  setFormData(data)
            } catch(err) {
                setPublishError(error);
            }
        }

        getRequestInfo()
      }, []);

  return (
    <div>RequestDetail</div>
  )
}
