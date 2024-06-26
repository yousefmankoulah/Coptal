import { Button, Rating, Table , Card, Modal, TextInput, Label, Dropdown } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RequestAccess from "../components/RequestAccess";
import CustomModal from "../components/CustomeModal";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import ReactStars from "react-rating-stars-component";
import { FaEllipsisV } from "react-icons/fa";

// Fix the default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function BusinessDetail() {
  const [formData, setFormData] = useState({});
  const { currentUser, token } = useSelector((state) => state.user);
  const [comment, setComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRatingData] = useState({ rating: 0, comment: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [updateComment, setUpdateComment] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [postId, setPostId] = useState("");
  const [publishError, setPublishError] = useState(null);


  const toggleDropdown = (index) => {
    if (isDropdownOpen === index) {
      setIsDropdownOpen(null);
    } else {
      setIsDropdownOpen(index);
    }
  };


  const handleChange = (e) => {
    const { id, value } = e.target;
    setRatingData((prevRating) => ({
      ...prevRating,
      [id]: value.trim(),
    }));
  };

  const handleCommentChange = (e) => {
    const { id, value } = e.target;
    setUpdateComment((prevRating) => ({
      ...prevRating,
      [id]: value.trim(),
    }));
  };
  
  const { id } = useParams();
  const navigate = useNavigate();

 
  const handleKeyPress = (event) => {
    if (event.key === "r") { 
      setShowModal(true);
    }
  };


  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };


  useEffect(() => {
    const handleSubmit = async () => {
  
      try {
        
        const res = await fetch(
          `${import.meta.env.VITE_DOMAIN}/api/business/getABusiness/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
  
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        setPublishError(null);
        setFormData(data);
      } catch (error) {
        setPublishError("Something went wrong");
      }
    };


    const getComment = async () => {
      
      try {
        
        const res = await fetch(
          `${import.meta.env.VITE_DOMAIN}/api/business/getBusinessReview/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
  
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        setPublishError(null);
        setComment(data);
      } catch (error) {
        setPublishError("Something went wrong");
      }
    };

    handleSubmit()
    getComment()
  }, [updateComment, comment, currentUser])


  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const remainingStars = 5 - filledStars;
    const stars = [];

    for (let i = 0; i < filledStars; i++) {
      stars.push(<Rating.Star key={`filled-${i}`} />);
    }

    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Rating.Star key={`empty-${i}`} filled={false} />);
    }

    return stars;
  };

  const RatingStars = ({ rating }) => (
    <div className="rating-stars">
      {rating ? (
        <div className="flex items-center">
          {renderStars(rating)}
          <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{rating} out of 5</p>
        </div>
      ) : (
        <p>No reviews yet</p>
      )}
    </div>
  );


  const handleDeletePost = async () => {
    setShowDeleteModal(false);
    setPublishError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/deleteBusiness/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
      } else {
        navigate(`/`);
        setShowDeleteModal(true)
        setPublishError(null);
      }
    } catch (error) {
      setPublishError(error.message);
    }
  };

  const handleDeleteComment = async () => {
    setShowDeleteCommentModal(false);
    setPublishError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/deleteComment/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
      } else {
        setIsDropdownOpen(null);
        setShowDeleteCommentModal(false)
        setComment((prev) =>
          prev.filter((post) => post._id !== postId)
        );
        setPublishError(null);
      }
    } catch (error) {
      setPublishError(error.message);
    }
  };


  const handleRatingBusiness = async (e) => {
    e.preventDefault();
    setShowRatingModal(false);
    setPublishError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/addRating/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rating)
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
      } else {
        setComment((prevComments) => [...prevComments, data]);
        setShowRatingModal(false);
        setRatingData({ rating: 0, comment: "" }); 
        setPublishError(null);
      }
    } catch (error) {
      setPublishError(error.message);
    }
  };


  const handleUpdateComment = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setShowUpdateModal(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/updateComment/${postId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateComment)
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
      } else {
        setComment((prevComments) => [...prevComments, data]);
        navigate(`/businessDetail/${id}`)
        setShowUpdateModal(false);
        setIsDropdownOpen(null);
        setPublishError(null);
      }
    } catch (error) {
      setPublishError(error.message);
    }
  };



  return (
    <div className="min-h-screen mt-20">
      <Card className="lg:w-3/4 xs:w-full mx-auto shadow-2xl rounded-2xl">
      <div className="h-36 lg:h-auto lg:w-48 flex-none bg-cover text-center overflow-hidden sm:w-36 xs:w-36 mx-auto" mt-10>
            <img 
              src={formData.businessLogo} 
              alt={`${formData.businessName} company logo`} 
              className="w-48 h-48 object-cover rounded-full"
             />
        </div>

        <h1 className="font-bold text-center text-3xl uppercase mt-10 mb-1">{formData.businessName} Profile</h1>
        <div className="text-center mx-auto">
            {formData.businessTotalRating && formData.businessTotalRating > 0 ? (
                <Rating>
              <RatingStars rating={formData.businessTotalRating} />
                </Rating>
                ) : (
                  <p>No reviews yet</p>
                )}
        </div>
        <p className="text-center mb-10 font-mono">Local <b>{formData.businessCategory}</b> in your area</p>

                {formData.businessServices && formData.businessServices.length > 0 && (
        <div className="overflow-x-auto lg:w-3/4 xs:w-full sm:w-3/4 mx-auto shadow-xl rounded-xl">
      <Table>
        <Table.Head>
          <Table.HeadCell>Service name</Table.HeadCell>
          <Table.HeadCell>Minimum Price</Table.HeadCell>
          <Table.HeadCell>Maximum Price</Table.HeadCell>

        </Table.Head>
        <Table.Body className="divide-y">
          {formData.businessServices.map((business) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {business.serviceName}
            </Table.Cell>
            <Table.Cell>{business.minPrice}</Table.Cell>
            <Table.Cell>{business.maxPrice}</Table.Cell>
           
          </Table.Row>
          ))}

        </Table.Body>
      </Table>
    </div>
    )}

        <div className="mt-10 mb-5 mx-auto">
          <span className="text-blue-950 text-left">{formData.businessDescription}</span>
        </div>

        
        <div className="justify-center items-center p-4 rounded-2xl">
          
          {!showModal && !showRatingModal && !showDeleteModal && formData.servingArea && formData.servingArea.location && (
            <>
            <p className="text-center text-xl mt-6 mb-2 font-bold">Serving Area in {formData.servingArea.zipCode}</p>
            <MapContainer
              center={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]}
              zoom={8}
              scrollWheelZoom={true}
              className="h-96 w-full lg:w-1/2"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]} />
              <Circle
                center={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]}
                radius={formData.servingArea.rangeInMiles * 1609.34} // Convert miles to meters
              />
            </MapContainer>
            </>
          )}
        </div>

        <div className="mx-auto w-4/5 mt-10 mb-10">
        
        {currentUser ? (
          <>
          {formData.userId === currentUser._id ? (
             <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2 mx-auto">
            <Button className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg" color="success"> <Link to={`/updateBusiness/${id}`}>Update the Business</Link></Button>
            <Button className="bg-red-700 text-white w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg" color="red" onClick={() => {
                      setShowDeleteModal(true);
                    }}>Delete the Business</Button>
          </div>
          ): (
            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center mx-auto gap-2">
            <Button color="success" className="w-full sm:w-auto px-6 py-2 text-lg"  onClick={() => setShowModal(true)}>Request Service</Button>
            <Button color="blue" className="w-full sm:w-auto px-6 py-2 text-lg" onClick={() => {
                      setShowRatingModal(true);
                  
                    }}>Leave a Comment</Button>

            <CustomModal showModal={showModal} onClose={handleCloseModal}>
              <RequestAccess id={id} onClose={handleCloseModal} />
            </CustomModal>

            </div>
          )}
          </>
        ): (
          <>
          <Button className="mx-auto" color="success">
            <Link to="/sign-in" className="text-white no-underline">
              Request Access
            </Link>
          </Button>
          </>
        )}
        
        </div>
       
      </Card>

      <h3 className="text-2xl text-center font-bold mt-10 mb-10">Ratings and Comments</h3>
      <Card className="lg:w-3/4 xs:w-full mx-auto shadow-2xl rounded-2xl p-6 bg-white mb-5">
      {comment && comment.length > 0 ? (
        <>
          {comment.map((comments, index) => (
               <div
               key={index}
               className="relative flex flex-col lg:flex-row items-start bg-gray-100 p-6 rounded-lg shadow-md space-y-4 lg:space-y-0 lg:space-x-4"
             >
    
              {comments.userId && currentUser._id === comments.userId._id && (
                <div className="absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FaEllipsisV />
                  </button>
                  {isDropdownOpen === index && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => {
                        setShowUpdateModal(true);
                        setPostId(comments._id)
                      }}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        Update your comment
                      </button>
                      <hr />
                      <button
                        onClick={() => {
                        setShowDeleteCommentModal(true);
                        setPostId(comments._id)
                      }}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        Delete your comment
                      </button>
                    </div>
                  )}
                </div>
                </div>
              )}
               
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                className="rounded-full w-24 h-24"
                alt="Profile"
              />
              <div className="flex-1">
                {comments.userId && (
                  <h4 className="font-bold text-lg">{comments.userId.fullName}</h4>
                )}
                
                <div className="mt-2 lg:mt-0">
                  <Rating>
                    <RatingStars rating={comments.rating} />
                  </Rating>
                </div>
                <p className="mt-2 text-gray-700">{comments.comment}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Created on {new Date(comments.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="text-center text-gray-500">No ratings or comments exist</p>
      )}
    </Card>


    <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this Business?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePost}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
            {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
          </div>
        </Modal.Body>
      </Modal>


      <Modal
        show={showDeleteCommentModal}
        onClose={() => setShowDeleteCommentModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this Comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteComment}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowDeleteCommentModal(false)}>
                No, cancel
              </Button>
            </div>
            {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
          </div>
        </Modal.Body>
      </Modal>


      <Modal
        show={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
            Coptal
          </span>
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Leave Rating and Comment
            </h3>
            <form onSubmit={handleRatingBusiness}>
            <ReactStars
              id="rating"
              name="rating"
              count={5}
              value={rating.rating}
              onChange={(newRating) => {
                setRatingData((prevRating) => ({
                  ...prevRating,
                  rating: newRating,
                }));
              }}
              size={35}
              activeColor="#ffd700"
              classNames="mx-auto"
              isHalf={true}
              emptyIcon={<i className="far fa-star"></i>}
              halfIcon={<i className="fa fa-star-half-alt"></i>}
              fullIcon={<i className="fa fa-star"></i>}
             
            />

              <Label value="Add your comment" className="font-bold mb-2 mt-2" />
              <TextInput 
                id="comment"
                value={rating.comment}
                type="text"
                name="comment"
                placeholder="Your comment"
                onChange={handleChange}
              />
            <div className="flex justify-center gap-4 mt-5">             
              <Button color="success" type="submit">
                Submit
              </Button>
              <Button color="gray" onClick={() => setShowRatingModal(false)}>
                No, cancel
              </Button>
            </div>
            {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
            </form>
          </div>
        </Modal.Body>
      </Modal>


      <Modal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
            Coptal
          </span>
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Add or Update your Comment
            </h3>
            <form onSubmit={handleUpdateComment}>

              <Label value="Add your comment" className="font-bold mb-2 mt-2" />
              <TextInput 
                id="comment"
                value={updateComment.comment}
                type="text"
                name="comment"
                placeholder="Your comment"
                onChange={handleCommentChange}
              />
            <div className="flex justify-center gap-4 mt-5">             
              <Button color="success" type="submit">
                Update
              </Button>
              <Button color="gray" onClick={() => setShowUpdateModal(false)}>
                No, cancel
              </Button>
            </div>
            {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
            </form>
          </div>
        </Modal.Body>
      </Modal>

      {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
    </div>
  )
}
