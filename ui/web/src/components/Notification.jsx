import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Notification() {
  const [notification, setNotification] = useState([]);
  const { currentUser, token } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (currentUser && currentUser._id) {
          const url = `${import.meta.env.VITE_DOMAIN}/api/auth/notify`;
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            if (data.length > notification.length) {
              playBeepSound();
            }
            setNotification(data);
          } else {
            console.error("Error fetching notifications:", data.message);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const playBeepSound = () => {
      const beep = new Audio("/path/to/beep.mp3"); // Adjust the path to your beep sound file
      beep.play();
    };

    fetchNotifications();
  }, [currentUser, token, notification]);

  const handleNotificationClick = async (notificationId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/auth/notifyRead/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: true }),
        }
      );
      if (res.ok) {
        const updatedList = notification.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: true }
            : notification
        );
        setNotification(updatedList);
      } else {
        console.error("Error marking notification as read:", res.statusText);
      }
    } catch (error) {
      console.error("Error updating notification status:", error.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <div className="fixed right-4 lg:w-1/4 sm:w-3/4 xs:w-4/5 bg-white text-black p-4 h-screen overflow-hidden">
      <div className="overflow-y-auto h-full">
        {notification && notification.length ? (
          <ul className="space-y-4">
            {notification.map((notify) => (
              <li key={notify.id} className="flex items-center">
                {notify.classification === "rating" ? (
                  <Link
                    to={`/businessDetail/${notify.postId}`}
                    className="flex items-center w-full"
                    onClick={() => handleNotificationClick(notify._id)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !notify.status ? "bg-green-500" : "bg-gray-500"
                      } mr-2`}
                    ></div>

                    <div className="flex flex-col flex-grow">
                      <span className={!notify.status ? "font-bold" : ""}>
                        {notify.message}
                      </span>
                      <div className="flex justify-between">
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatDate(notify.date)}
                        </span>
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatTime(notify.date)}
                        </span>
                      </div>
                      <hr />
                    </div>
                  </Link>
                ) : notify.classification === "requestBusiness" ? (
                  <Link
                    to={`/RequestDetail/${notify.postId}`}
                    className="flex items-center w-full"
                    onClick={() => handleNotificationClick(notify._id)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !notify.status ? "bg-green-500" : "bg-gray-500"
                      } mr-2`}
                    ></div>
                    <div className="flex flex-col">
                      <span className={!notify.status ? "font-bold" : ""}>
                        {notify.message}
                      </span>
                      <div className="flex justify-between">
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatDate(notify.date)}
                        </span>
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatTime(notify.date)}
                        </span>
                      </div>
                      <hr />
                    </div>
                  </Link>
                ) : notify.classification === "requestCustomer" ? (
                  <Link
                    to={`/RequestDetail/${notify.postId}`}
                    className="flex items-center w-full"
                    onClick={() => handleNotificationClick(notify._id)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !notify.status ? "bg-green-500" : "bg-gray-500"
                      } mr-2`}
                    ></div>
                    <div className="flex flex-col">
                      <span className={!notify.status ? "font-bold" : ""}>
                        {notify.message}
                      </span>
                      <div className="flex justify-between">
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatDate(notify.date)}
                        </span>
                        <span className={!notify.status ? "font-bold" : ""}>
                          {formatTime(notify.date)}
                        </span>
                      </div>
                      <hr />
                    </div>
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <span>No Notifications Sent to You</span>
        )}
      </div>
    </div>
  );
}
