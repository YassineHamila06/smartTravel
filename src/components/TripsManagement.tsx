import React, { useState, useRef } from "react";
import { Edit, Trash2, Power, Search, Filter } from "lucide-react";
import type { Trip } from "../types";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import {
  useGetTripsQuery,
  useDeleteTripMutation,
  useToggleTripStatusMutation,
  useCreateTripMutation,
  useUpdateTripMutation,
} from "../../services/TRIP-API";

// Define TripFormData type outside both components
type TripFormData = Partial<Trip> & {
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  isAvailable: boolean;
  reduction: number;
  image?: any;
  description: string;
  tripType: string;
};

// TripForm component moved outside TripsManagement
const TripForm = ({
  trip,
  setTrip,
  onSubmit,
  mode,
  tripImage,
  errors = {},
  handleImageChange,
  fileInputRef,
  onCancel,
}: {
  trip: TripFormData;
  setTrip: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  mode: "add" | "edit";
  tripImage?: File | null;
  errors: Record<string, string>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onCancel: () => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="bg-gradient-to-r from-turquoise-50 to-white p-5 rounded-lg shadow-sm mb-6">
      <div className="text-sm text-gray-500 mb-4">
        {mode === "add"
          ? "Creating a new destination"
          : "Updating destination details"}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trip Type
        </label>
        <select
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={trip.tripType}
          onChange={(e) =>
            setTrip((prev: any) => ({ ...prev, tripType: e.target.value }))
          }
        >
          <option value="Beach destination">Beach destination</option>
          <option value="Cultural tour">Cultural tour</option>
          <option value="Adventure travel">Adventure travel</option>
          <option value="Nature escape">Nature escape</option>
          <option value="City break">City break</option>
          <option value="Luxury travel">Luxury travel</option>
          <option value="Budget travel">Budget travel</option>
          <option value="Wellness retreat">Wellness retreat</option>
          <option value="Family vacation">Family vacation</option>
        </select>
        {errors.tripType && (
          <p className="text-red-500 text-sm mt-1">{errors.tripType}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination
        </label>
        <input
          type="text"
          required
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={trip.destination}
          onChange={(e) =>
            setTrip((prev: any) => ({ ...prev, destination: e.target.value }))
          }
        />
        {errors.destination && (
          <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          required
          rows={4}
          className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
          value={trip.description}
          onChange={(e) =>
            setTrip((prev: any) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the trip details, attractions, accommodations, etc."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>

        <div className="space-y-4">
          {tripImage ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 flex-1 truncate">
                {tripImage.name}
              </div>
              <button
                type="button"
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() =>
                  setTrip((prev: any) => ({ ...prev, image: null }))
                }
              >
                Remove
              </button>
            </div>
          ) : null}

          <input
            type="file"
            name="image"
            ref={fileInputRef}
            accept="image/*"
            className="block w-full px-3 py-2 text-sm text-gray-700 
            border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-turquoise-500 focus:border-turquoise-500"
            onChange={handleImageChange}
          />
        </div>

        {!tripImage && errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>
    </div>

    <div className="bg-gradient-to-r from-turquoise-50 to-white p-5 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Trip Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            required={mode === "add"}
            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
            value={
              trip.startDate
                ? new Date(trip.startDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setTrip((prev: any) => ({ ...prev, startDate: e.target.value }))
            }
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            required={mode === "add"}
            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
            value={
              trip.endDate
                ? new Date(trip.endDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setTrip((prev: any) => ({ ...prev, endDate: e.target.value }))
            }
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              type="number"
              required
              min="0"
              className="block w-full pl-8 px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
              value={trip.price}
              onChange={(e) =>
                setTrip((prev: any) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reduction (%)
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              max="100"
              className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
              value={trip.reduction}
              onChange={(e) =>
                setTrip((prev: any) => ({
                  ...prev,
                  reduction: Number(e.target.value),
                }))
              }
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              %
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Availability
        </label>
        <div className="flex space-x-4 mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-turquoise-600"
              name="availability"
              value="true"
              checked={trip.isAvailable}
              onChange={() =>
                setTrip((prev: any) => ({ ...prev, isAvailable: true }))
              }
            />
            <span className="ml-2 text-gray-700">Available</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-red-600"
              name="availability"
              value="false"
              checked={!trip.isAvailable}
              onChange={() =>
                setTrip((prev: any) => ({ ...prev, isAvailable: false }))
              }
            />
            <span className="ml-2 text-gray-700">Not Available</span>
          </label>
        </div>
      </div>
    </div>

    <div className="flex justify-end space-x-4 mt-8">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-3 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700 transition-colors flex items-center"
      >
        {mode === "add" ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Trip
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Update Trip
          </>
        )}
      </button>
    </div>
  </form>
);

const TripsManagement = () => {
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripDetailsModalOpen, setIsTripDetailsModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tripImage, setTripImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({
    destination: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    availability: "all",
    minReduction: "",
    maxReduction: "",
  });

  //RTK Query Hooks
  const {
    data: tripsData = [],
    isLoading,
    error,
    refetch: refetchTrips,
  } = useGetTripsQuery();
  const [createTrip] = useCreateTripMutation();
  const [updateTrip] = useUpdateTripMutation();
  const [deleteTrip] = useDeleteTripMutation();
  const [toggleTripStatus] = useToggleTripStatusMutation();

  const [newTrip, setNewTrip] = useState<Omit<Trip, "id">>({
    destination: "",
    startDate: "",
    endDate: "",
    price: 0,
    isAvailable: true,
    reduction: 0,
    image: "",
    description: "",
    tripType: "Beach destination",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTripImage(e.target.files[0]);
    }
  };

  const validateForm = (trip: TripFormData) => {
    const newErrors: Record<string, string> = {};

    if (!trip.destination.trim())
      newErrors.destination = "Destination is required";
    if (!trip.description.trim())
      newErrors.description = "Description is required";
    if (!trip.price || trip.price <= 0)
      newErrors.price = "The price must be greater than 0";
    if (!trip.startDate.trim()) newErrors.startDate = "Start date is required";
    if (!trip.endDate || new Date(trip.endDate) <= new Date(trip.startDate))
      newErrors.endDate = "End date must be after start date";
    if (trip.tripType.trim() === "")
      newErrors.tripType = "Trip type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the validateForm function
    if (!validateForm(newTrip as TripFormData)) return;

    try {
      const formData = new FormData();
      formData.append("destination", newTrip.destination);
      formData.append("description", newTrip.description || "");
      formData.append("debutDate", newTrip.startDate);
      formData.append("endDate", newTrip.endDate);
      formData.append("price", String(newTrip.price));
      formData.append("reduction", String(newTrip.reduction || 0));
      formData.append("isActive", String(newTrip.isAvailable));
      formData.append("tripType", newTrip.tripType);

      // Handle image: only use file upload
      if (tripImage) {
        formData.append("image", tripImage);
      }

      try {
        await createTrip(formData).unwrap();
        setIsAddTripModalOpen(false);
        refetchTrips();
        // Reset the image state
        setTripImage(null);

        setNewTrip({
          destination: "",
          startDate: "",
          endDate: "",
          price: 0,
          isAvailable: true,
          reduction: 0,
          image: "",
          description: "",
          tripType: "Beach destination",
        });
      } catch (error) {
        console.error("Failed to create trip:", error);
      }
    } catch (error: unknown) {
      console.error("Failed to add trip:", error);
      alert("Failed to add trip. Please try again.");
    }
  };

  const handleEditTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    // Use the validateForm function
    if (!validateForm(selectedTrip as TripFormData)) return;

    try {
      const formData = new FormData();
      formData.append("destination", selectedTrip.destination);
      formData.append("debutDate", selectedTrip.startDate);
      formData.append("endDate", selectedTrip.endDate);
      formData.append("price", String(selectedTrip.price));
      formData.append("reduction", String(selectedTrip.reduction));
      formData.append("isActive", String(selectedTrip.isAvailable));
      formData.append("description", selectedTrip.description || "");
      formData.append("tripType", selectedTrip.tripType);

      // Handle image: only use file upload
      if (tripImage) {
        formData.append("image", tripImage);
      }

      console.log("Updating trip with ID:", selectedTrip.id);
      const result = await updateTrip({
        id: selectedTrip.id,
        data: formData,
      }).unwrap();
      console.log("Update result:", result);

      setIsEditTripModalOpen(false);
      setSelectedTrip(null);
      // Reset the image state
      setTripImage(null);
    } catch (error: unknown) {
      console.error("Failed to update trip:", error);
      alert("Failed to update trip. Please try again.");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      console.log("Deleting trip with ID:", tripId);
      const result = await deleteTrip(tripId).unwrap();
      console.log("Delete result:", result);

      setIsDeleteDialogOpen(false);
      setSelectedTrip(null);
    } catch (error: unknown) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

  const handleToggleAvailability = async (tripId: string) => {
    try {
      console.log("Toggling status for trip with ID:", tripId);
      const result = await toggleTripStatus(tripId).unwrap();
      console.log("Toggle result:", result);
    } catch (error: unknown) {
      console.error("Failed to toggle trip status:", error);
      alert("Failed to change trip status. Please try again.");
    }
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripDetailsModalOpen(true);
  };

  const closeTripDetailsModal = () => {
    setIsTripDetailsModalOpen(false);
    setSelectedTrip(null);
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
          Error loading trips. Please try again later.
        </div>
      </div>
    );
  }

  const filteredTrips = tripsData.filter((trip: Trip) => {
    if (
      filters.destination &&
      !trip.destination
        .toLowerCase()
        .includes(filters.destination.toLowerCase()) &&
      !trip.description
        .toLowerCase()
        .includes(filters.destination.toLowerCase())
    )
      return false;
    if (filters.minPrice && trip.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && trip.price > Number(filters.maxPrice)) return false;
    if (
      filters.startDate &&
      new Date(trip.startDate) < new Date(filters.startDate)
    )
      return false;
    if (filters.endDate && new Date(trip.endDate) > new Date(filters.endDate))
      return false;
    if (
      filters.availability !== "all" &&
      trip.isAvailable !== (filters.availability === "available")
    )
      return false;
    if (filters.minReduction && trip.reduction < Number(filters.minReduction))
      return false;
    if (filters.maxReduction && trip.reduction > Number(filters.maxReduction))
      return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <button
          onClick={() => setIsAddTripModalOpen(true)}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-turquoise-700"
        >
          Add New Trip
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search destinations or descriptions..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-turquoise-500"
                value={filters.destination}
                onChange={(e) =>
                  setFilters({ ...filters, destination: e.target.value })
                }
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price Range
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                  value={filters.availability}
                  onChange={(e) =>
                    setFilters({ ...filters, availability: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reduction Range (%)
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.minReduction}
                    onChange={(e) =>
                      setFilters({ ...filters, minReduction: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.maxReduction}
                    onChange={(e) =>
                      setFilters({ ...filters, maxReduction: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrips.map((trip) => (
              <React.Fragment key={trip.id}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer ${
                    !trip.isAvailable ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleTripClick(trip)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trip.image ? (
                        <img
                          src={trip.image}
                          alt={trip.destination}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/40?text=NA";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-400 text-xs">
                          N/A
                        </div>
                      )}
                      <span className="text-gray-900 font-medium">
                        {trip.destination}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(trip.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(trip.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${trip.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trip.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trip.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trip.reduction}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-turquoise-600 hover:text-turquoise-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrip(trip);
                          setIsEditTripModalOpen(true);
                        }}
                        title="Edit Trip"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrip(trip);
                          setIsDeleteDialogOpen(true);
                        }}
                        title="Delete Trip"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAvailability(trip.id);
                        }}
                        title="Toggle Availability"
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        title="Add New Trip"
      >
        <TripForm
          trip={newTrip as TripFormData}
          setTrip={setNewTrip}
          onSubmit={handleAddTrip}
          mode="add"
          tripImage={tripImage}
          errors={errors}
          handleImageChange={handleImageChange}
          fileInputRef={fileInputRef}
          onCancel={() => setIsAddTripModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditTripModalOpen}
        onClose={() => setIsEditTripModalOpen(false)}
        title="Edit Trip"
      >
        {selectedTrip && (
          <TripForm
            trip={selectedTrip as TripFormData}
            setTrip={setSelectedTrip}
            onSubmit={handleEditTrip}
            mode="edit"
            tripImage={tripImage}
            errors={errors}
            handleImageChange={handleImageChange}
            fileInputRef={fileInputRef}
            onCancel={() => setIsEditTripModalOpen(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isTripDetailsModalOpen}
        onClose={closeTripDetailsModal}
        title="Trip Details"
      >
        {selectedTrip && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                {selectedTrip.image ? (
                  <img
                    src={selectedTrip.image}
                    alt={selectedTrip.destination}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150?text=Image+Not+Available";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg shadow-md text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {selectedTrip.destination}
                    </h3>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Start Date
                          </p>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedTrip.startDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            End Date
                          </p>
                          <p className="text-sm text-gray-900">
                            {new Date(
                              selectedTrip.endDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Price
                          </p>
                          <p className="text-sm text-gray-900">
                            ${selectedTrip.price}
                            {selectedTrip.reduction > 0 && (
                              <span className="text-red-600 ml-1">
                                (Save {selectedTrip.reduction}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Status
                          </p>
                          <p className="text-sm text-gray-900">
                            <span
                              className={
                                selectedTrip.isAvailable
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {selectedTrip.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Trip Type
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedTrip.tripType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      Description
                    </h4>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {selectedTrip.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      onClick={closeTripDetailsModal}
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTripDetailsModalOpen(false);
                        setIsEditTripModalOpen(true);
                      }}
                    >
                      Edit Trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedTrip && handleDeleteTrip(selectedTrip.id)}
        message={`Do you really want to delete the trip to ${selectedTrip?.destination}?`}
      />
    </div>
  );
};

export default TripsManagement;
