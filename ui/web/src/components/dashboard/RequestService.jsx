import { Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";


export default function RequestService() {
    const { currentUser, token } = useSelector((state) => state.user);
    const [requestService, setRequestService] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
  
    useEffect(() => {
      const fetchRequestService = async () => {
        try {
          if (currentUser && currentUser._id) {
            const url = currentUser.role === "business" ? `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetailBusiness` : `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetailCustomer`;
            const res = await fetch(
              url,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await res.json();
            if (res.ok) {
              setRequestService(data);
            } else {
              // Handle unauthorized access or other errors
              console.error("Error fetching request:", data.message);
            }
          }
        } catch (error) {
          console.log(error.message);
        }
      };
  
      fetchRequestService();
    }, [currentUser]);
  
   
  
    useEffect(() => {
      setFilteredCustomers(
        requestService.filter(
          (customer) =>
            customer.serviceDescription
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            customer.service
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            customer.serviceDate?.includes(searchQuery) 
        )
      );
    }, [requestService, searchQuery]);
  
    return (
      <div className="container mr-auto ml-auto table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
        <div className="mb-2 mt-4 text-black">
          <input
            type="text"
            placeholder="Search by Service Name, Offer Price, or Service description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-1/4 rounded-xl"
          />
        </div>
  
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell className="bg-slate-700 text-white">
              Business Name
            </Table.HeadCell>
            <Table.HeadCell className="bg-slate-700 text-white">
            Service Name
            </Table.HeadCell>
            <Table.HeadCell className="bg-slate-700 text-white">
            Status
            </Table.HeadCell>
            <Table.HeadCell className="bg-slate-700 text-white">
              Updates
            </Table.HeadCell>
          </Table.Head>
          {requestService && requestService.length > 0 ? ( 
            filteredCustomers.map((customer) => (
              <Table.Body className="divide-y" key={customer._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    {customer.businessId && (
                  <Table.Cell
                    className="whitespace-nowrap font-medium text-gray-900 dark:text-white light:bg-slate-50"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <img
                      src={customer.businessId.businessLogo}
                      className="rounded-3xl w-10 h-10 float-left"
                      alt="Business Profile Picture"
                    />
                    <span className="text-center ml-4">
                      {customer.businessId.businessName}
                    </span>
                  </Table.Cell>
                  )}
  
                  <Table.Cell className="light:bg-slate-50">
                    {customer.service}
                  </Table.Cell>
                  <Table.Cell className="light:bg-slate-50">
                    {customer.status}{currentUser.role === "business" && customer.paid ?(
                      <p>
                        {" "},Paid
                      </p>
                    ): (
                      <p>
                        {" "},Unpaid
                      </p>
                    )}
                  </Table.Cell>
                  <Table.Cell className="light:bg-slate-50">
                    <Link
                      to={`/RequestDetail/${customer._id}`}
                      className="text-teal-500 hover:underline"
                    >
                      <span className="whitespace-nowrap font-medium text-gray-900 dark:text-white mr-2">
                        View Details
                      </span>
                    </Link>
                    
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))
          ) : (
            <Table.Body className="divide-y">
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center">
                  No Requests to display
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          )}
        </Table>
       
      </div>
    );
}
