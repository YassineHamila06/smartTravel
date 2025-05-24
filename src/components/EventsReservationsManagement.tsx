import { useState } from "react";
import { Search, Filter, X, CheckCircle, AlertCircle } from "lucide-react";
import {
  useGetEventReservationsQuery,
  useGetEventReservationQuery,
  useUpdateEventReservationStatusMutation,
  EventReservation,
} from "../../services/EVENT-RESERVATION-API";

interface StatusModalProps {
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

const EventsReservationsManagement = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState("");
  const [isStatusUpdateSuccess, setIsStatusUpdateSuccess] = useState(true);

  // Use RTK Query hooks
  const {
    data: reservationsData,
    isLoading,
    isError,
    refetch,
  } = useGetEventReservationsQuery();

  // Query for selected reservation details
  const { data: selectedReservationData, isLoading: isLoadingDetails } =
    useGetEventReservationQuery(selectedReservationId || "", {
      skip: !selectedReservationId,
    });

  const [updateReservationStatus] = useUpdateEventReservationStatusMutation();

  const handleStatusChange = async (
    id: string,
    newStatus: EventReservation["status"]
  ) => {
    try {
      await updateReservationStatus({ id, status: newStatus }).unwrap();
      setStatusUpdateMessage(
        `Reservation status successfully updated to ${newStatus}`
      );
      setIsStatusUpdateSuccess(true);
      setStatusModalOpen(true);
    } catch (err) {
      console.error(`Error updating reservation ${id} status:`, err);
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update reservation status. Please try again.";
      setStatusUpdateMessage(errorMsg);
      setIsStatusUpdateSuccess(false);
      setStatusModalOpen(true);
    }
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
  };

  // Status Update Modal Component
  const StatusUpdateModal = ({
    isSuccess,
    message,
    onClose,
  }: StatusModalProps) => (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            {isSuccess ? (
              <CheckCircle className="text-secondary mr-3" size={24} />
            ) : (
              <AlertCircle className="text-red-500 mr-3" size={24} />
            )}
            <h3
              className={`text-lg font-medium ${
                isSuccess ? "text-black" : "text-black"
              }`}
            >
              {isSuccess ? "Success" : "Error"}
            </h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isSuccess
                  ? "bg-secondary hover:bg-secondary/80 text-white"
                  : "bg-secondary hover:bg-secondary/80 text-white"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredReservations = (reservationsData || []).filter(
    (reservation) => {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch =
        `${reservation.clientFirstName} ${reservation.clientLastName}`
          .toLowerCase()
          .includes(searchLower);
      const eventMatch = reservation.eventName
        .toLowerCase()
        .includes(searchLower);
      const idMatch = reservation.id.toLowerCase().includes(searchLower);

      const statusMatch = !statusFilter || reservation.status === statusFilter;

      return (nameMatch || eventMatch || idMatch) && statusMatch;
    }
  );

  const handleReservationClick = (id: string) => {
    setSelectedReservationId(id);
  };

  const closeDetailsModal = () => {
    setSelectedReservationId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Event Reservations
      </h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search reservations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="ml-4 px-4 py-2 flex items-center space-x-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {filterOpen && (
            <div className="mt-3 p-3 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Filter by Status
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter(null)}
                  className={`px-3 py-1 rounded ${
                    !statusFilter ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 rounded ${
                    statusFilter === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter("confirmed")}
                  className={`px-3 py-1 rounded ${
                    statusFilter === "confirmed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`px-3 py-1 rounded ${
                    statusFilter === "cancelled"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Cancelled
                </button>
                <button
                  onClick={() => setStatusFilter("paid")}
                  className={`px-3 py-1 rounded ${
                    statusFilter === "paid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading reservations...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Failed to load reservations</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleReservationClick(reservation.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.clientFirstName}{" "}
                        {reservation.clientLastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(reservation.reservationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.eventName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.persons}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={reservation.status}
                        onChange={(e) =>
                          handleStatusChange(
                            reservation.id,
                            e.target.value as EventReservation["status"]
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedReservationId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Reservation Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingDetails ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    Loading reservation details...
                  </p>
                </div>
              ) : selectedReservationData ? (
                <div className="space-y-6">
                  {/* Reservation Info */}
                  <div>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Status
                          </p>
                          <p className="text-sm text-gray-900">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                selectedReservationData.status
                              )}`}
                            >
                              {selectedReservationData.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Total Price
                          </p>
                          <p className="text-sm text-gray-900">
                            ${selectedReservationData.totalPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Number of People
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedReservationData.persons}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Payment Method
                          </p>
                          <p className="text-sm text-gray-900 capitalize">
                            {selectedReservationData.paymentMethod ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Client Information
                    </h3>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Client Name
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedReservationData.clientFirstName}{" "}
                            {selectedReservationData.clientLastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Event Information
                    </h3>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Event Name
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedReservationData.eventName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedReservationData.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Notes
                      </h3>
                      <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          {selectedReservationData.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      onClick={closeDetailsModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No reservation details found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <StatusUpdateModal
          isSuccess={isStatusUpdateSuccess}
          message={statusUpdateMessage}
          onClose={closeStatusModal}
        />
      )}
    </div>
  );
};

export default EventsReservationsManagement;
