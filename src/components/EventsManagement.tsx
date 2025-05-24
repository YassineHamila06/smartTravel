import React, { useState, useRef } from "react";
import { Edit, Trash2, Power, Search, Filter } from "lucide-react";
import type { Event } from "../types";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useActivateEventMutation,
} from "../../services/EVENT-API";

// Move EventForm component outside EventsManagement
const EventForm = ({
  event,
  setEvent,
  onSubmit,
  mode,
  handleImageChange,
  imageFile,
  fileInputRef,
  onCancel,
}: {
  event: Omit<Event, "id">;
  setEvent: React.Dispatch<React.SetStateAction<Omit<Event, "id">>>;
  onSubmit: (e: React.FormEvent) => void;
  mode: "add" | "edit";
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onCancel: () => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="bg-gradient-to-r from-turquoise-50 to-white p-5 rounded-lg shadow-sm mb-6">
      <div className="text-sm text-gray-500 mb-4">
        {mode === "add" ? "Creating a new event" : "Updating event details"}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.title}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          required
          rows={4}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.description}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.location}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, location: e.target.value }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.date.toISOString().split("T")[0]}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, date: new Date(e.target.value) }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time
        </label>
        <input
          type="time"
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.time}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, time: e.target.value }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price
        </label>
        <input
          type="number"
          required
          min="0"
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={event.price}
          onChange={(e) =>
            setEvent((prev) => ({ ...prev, price: Number(e.target.value) }))
          }
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>
        <input
          type="file"
          ref={fileInputRef}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imageFile && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Selected file: {imageFile.name}
            </p>
          </div>
        )}
        {mode === "edit" && event.image && !imageFile && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Current image:</p>
            <img
              src={event.image}
              alt={event.title}
              className="mt-1 h-20 w-auto object-cover rounded-md"
            />
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-turquoise-600"
            checked={event.isActive}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span className="text-gray-700">Active</span>
        </label>
      </div>
    </div>

    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-turquoise-600 border border-transparent rounded-md hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
      >
        {mode === "add" ? "Add Event" : "Update Event"}
      </button>
    </div>
  </form>
);
const validateEventForm = (event: Omit<Event, "id">): string | null => {
  if (!event.title.trim()) return "Title is required.";
  if (!event.description.trim()) return "Description is required.";
  if (!event.location.trim()) return "Location is required.";
  if (!/^[a-zA-Z\sÀ-ÿ]+$/.test(event.location)) return "Location must contain only letters.";

  if (!event.price || event.price <= 0) return "Price must be greater than 0.";
  if (event.price > 9999) return "Price must not exceed 9999.";

  const today = new Date();
  if (!event.date || new Date(event.date) <= today) return "Date must be in the future.";

  if (!event.time.trim()) return "Time is required.";

  return null;
};


const EventsManagement = () => {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    date: "",
    isActive: "all",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const { data: events = [], isLoading, error } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [activateEvent] = useActivateEventMutation();

  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    title: "",
    description: "",
    image: "",
    location: "",
    date: new Date(),
    time: "",
    isActive: true,
    price: 0,
  });

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const filteredEvents = events.filter((event: Event) => {
    if (
      filters.title &&
      !event.title.toLowerCase().includes(filters.title.toLowerCase()) &&
      !event.description.toLowerCase().includes(filters.title.toLowerCase())
    )
      return false;
    if (
      filters.location &&
      !event.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.minPrice && event.price < Number(filters.minPrice))
      return false;
    if (filters.maxPrice && event.price > Number(filters.maxPrice))
      return false;
    if (filters.date && new Date(event.date) < new Date(filters.date))
      return false;
    if (
      filters.isActive !== "all" &&
      event.isActive !== (filters.isActive === "active")
    )
      return false;
    return true;
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const error = validateEventForm(newEvent);
    if (error) {
      alert(error);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("title", newEvent.title);
      formData.append("description", newEvent.description);
      if (imageFile) formData.append("image", imageFile);
      formData.append("location", newEvent.location);
      formData.append("date", newEvent.date.toISOString());
      formData.append("time", newEvent.time);
      formData.append("price", String(newEvent.price));
      formData.append("isActive", String(newEvent.isActive));
  
      await createEvent(formData).unwrap();
  
      setIsAddEventModalOpen(false);
      setImageFile(null);
      setNewEvent({
        title: "",
        description: "",
        image: "",
        location: "",
        date: new Date(),
        time: "",
        isActive: true,
        price: 0,
      });
    } catch (error: unknown) {
      console.error("Failed to add event:", error);
      alert("Failed to add event. Please try again.");
    }
  };
  

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
  
    const error = validateEventForm(selectedEvent);
    if (error) {
      alert(error);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("title", selectedEvent.title);
      formData.append("description", selectedEvent.description);
      if (imageFile) formData.append("image", imageFile);
      formData.append("location", selectedEvent.location);
      formData.append("date", new Date(selectedEvent.date).toISOString());
      formData.append("time", selectedEvent.time);
      formData.append("price", String(selectedEvent.price));
      formData.append("isActive", String(selectedEvent.isActive));
  
      await updateEvent({
        id: selectedEvent.id,
        data: formData,
      }).unwrap();
  
      setIsEditEventModalOpen(false);
      setImageFile(null);
      setSelectedEvent(null);
    } catch (error: unknown) {
      console.error("Failed to update event:", error);
      alert("Failed to update event. Please try again.");
    }
  };
  

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      console.log("Deleting event with ID:", selectedEvent.id);
      const result = await deleteEvent(selectedEvent.id).unwrap();
      console.log("Delete result:", result);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error: unknown) {
      console.error("Failed to delete event:", error);
      const errorObj = error as { data?: { message?: string } };
      alert(
        `Failed to delete event: ${
          errorObj.data?.message || "Unknown error occurred"
        }`
      );
    }
  };

  const handleToggleAvailability = async () => {
    if (!selectedEvent) return;
    try {
      console.log("Toggling availability for event with ID:", selectedEvent.id);
      const result = await activateEvent(selectedEvent.id).unwrap();
      console.log("Toggle result:", result);
    } catch (error: unknown) {
      console.error("Failed to toggle event availability:", error);
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Unknown error occurred";
      alert(`Failed to change event availability: ${errorMessage}`);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

  const closeEventDetailsModal = () => {
    setIsEventDetailsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turquoise-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading events. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <button
          onClick={() => setIsAddEventModalOpen(true)}
          className="px-4 py-2 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
        >
          Add New Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
              }
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise-500"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {filterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.isActive}
                onChange={(e) =>
                  setFilters({ ...filters, isActive: e.target.value })
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={event.image}
                          alt={event.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${event.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsEditEventModalOpen(true);
                        }}
                        className="text-turquoise-600 hover:text-turquoise-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          handleToggleAvailability();
                        }}
                        className={`${
                          event.isActive
                            ? "text-green-600 hover:text-green-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        title="Add New Event"
      >
        <EventForm
          event={newEvent}
          setEvent={setNewEvent}
          onSubmit={handleAddEvent}
          mode="add"
          handleImageChange={handleImageChange}
          imageFile={imageFile}
          fileInputRef={fileInputRef}
          onCancel={() => setIsAddEventModalOpen(false)}
        />
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        title="Edit Event"
      >
        {selectedEvent && (
          <EventForm
            event={{
              title: selectedEvent.title,
              description: selectedEvent.description,
              image: selectedEvent.image,
              location: selectedEvent.location,
              date: new Date(selectedEvent.date),
              time: selectedEvent.time,
              isActive: selectedEvent.isActive,
              price: selectedEvent.price,
            }}
            setEvent={(newEvent) => {
              if (selectedEvent) {
                setSelectedEvent({
                  ...selectedEvent,
                  ...newEvent,
                });
              }
            }}
            onSubmit={handleEditEvent}
            mode="edit"
            handleImageChange={handleImageChange}
            imageFile={imageFile}
            fileInputRef={fileInputRef}
            onCancel={() => setIsEditEventModalOpen(false)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteEvent}
        message="Are you sure you want to delete this event? This action cannot be undone."
      />

      {/* Event Details Modal */}
      <Modal
        isOpen={isEventDetailsModalOpen}
        onClose={closeEventDetailsModal}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="h-48 w-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEvent.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedEvent.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.location}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedEvent.date).toLocaleDateString()} at{" "}
                  {selectedEvent.time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="mt-1 text-sm text-gray-900">
                  ${selectedEvent.price}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsManagement;
