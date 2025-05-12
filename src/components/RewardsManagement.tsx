import React, { useState, useEffect, useRef } from "react";
import {
  useGetRewardsQuery,
  useCreateRewardMutation,
  useUpdateRewardMutation,
  useDeleteRewardMutation,
} from "../../services/REWARD-API";
import { useGetEventsQuery } from "../../services/EVENT-API";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import { Edit, Trash2, Search, Filter } from "lucide-react";

// Define types for rewards
interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  image: string;
  discountPercentage?: number;
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const RewardsManagement: React.FC = () => {
  // State for rewards data
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rewardsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    minPoints: "",
    maxPoints: "",
  });

  // State for modals and dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRewardDetailsModalOpen, setIsRewardDetailsModalOpen] =
    useState(false);

  // State for form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsRequired, setPointsRequired] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [eventId, setEventId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    refetch: refetchRewards,
  } = useGetRewardsQuery();
  const { data: events = [] } = useGetEventsQuery();
  const [createReward] = useCreateRewardMutation();
  const [updateReward] = useUpdateRewardMutation();
  const [deleteReward] = useDeleteRewardMutation();

  // Update local state when data is fetched
  useEffect(() => {
    if (rewardsData) {
      setRewards(rewardsData);
      setFilteredRewards(rewardsData);
    }
  }, [rewardsData]);

  // Effect for filtering rewards
  useEffect(() => {
    if (rewards.length) {
      let filtered = [...rewards];

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (reward) =>
            reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reward.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (filters.category !== "all") {
        filtered = filtered.filter(
          (reward) => reward.category === filters.category
        );
      }

      // Apply points filters
      if (filters.minPoints) {
        filtered = filtered.filter(
          (reward) => reward.pointsRequired >= Number(filters.minPoints)
        );
      }

      if (filters.maxPoints) {
        filtered = filtered.filter(
          (reward) => reward.pointsRequired <= Number(filters.maxPoints)
        );
      }

      setFilteredRewards(filtered);
      setCurrentPage(1); // Reset to first page after filtering
    }
  }, [searchTerm, filters, rewards]);

  // Derived state for pagination
  const indexOfLastReward = currentPage * rewardsPerPage;
  const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
  const currentRewards = filteredRewards.slice(
    indexOfFirstReward,
    indexOfLastReward
  );
  const totalPages = Math.ceil(filteredRewards.length / rewardsPerPage);

  // Unique categories for filtering
  const categories = rewards.length
    ? ["all", ...new Set(rewards.map((reward) => reward.category))]
    : ["all"];

  // List of available reward categories
  const availableCategories = ["Discount", "Gift"];

  // Handler functions
  const handleOpenAddModal = () => {
    setTitle("");
    setDescription("");
    setPointsRequired(0);
    setCategory("");
    setImage(null);
    setDiscountPercentage(0);
    setEventId("");
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (reward: Reward) => {
    setCurrentReward(reward);
    setTitle(reward.title);
    setDescription(reward.description);
    setPointsRequired(reward.pointsRequired);
    setCategory(reward.category);
    setDiscountPercentage(reward.discountPercentage || 0);
    setEventId(reward.eventId || "");
    setImage(null);
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleRewardClick = (reward: Reward) => {
    setCurrentReward(reward);
    setIsRewardDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsRewardDetailsModalOpen(false);
    setCurrentReward(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!pointsRequired || pointsRequired <= 0)
      newErrors.pointsRequired = "Points required must be greater than 0";
    if (!category.trim()) newErrors.category = "Category is required";
    if (!image && !currentReward?.image) newErrors.image = "Image is required";

    // Add validation for category-specific fields
    if (category === "Discount") {
      if (
        !discountPercentage ||
        discountPercentage <= 0 ||
        discountPercentage > 100
      ) {
        newErrors.discountPercentage =
          "Discount percentage must be between 1 and 100";
      }
    }

    if (category === "Gift" && !eventId) {
      newErrors.eventId = "An event must be selected for Gift rewards";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("pointsRequired", pointsRequired.toString());
    formData.append("category", category);

    // Add category-specific fields
    if (category === "Discount" && discountPercentage) {
      formData.append("discountPercentage", discountPercentage.toString());
    }

    if (category === "Gift" && eventId) {
      formData.append("eventId", eventId);
    }

    if (image) formData.append("image", image);

    try {
      await createReward(formData).unwrap();
      setIsAddModalOpen(false);
      refetchRewards();
    } catch (error) {
      console.error("Failed to create reward:", error);
    }
  };

  const handleEditReward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentReward) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("pointsRequired", pointsRequired.toString());
    formData.append("category", category);

    // Add category-specific fields
    if (category === "Discount" && discountPercentage) {
      formData.append("discountPercentage", discountPercentage.toString());
    }

    if (category === "Gift" && eventId) {
      formData.append("eventId", eventId);
    }

    if (image) formData.append("image", image);

    try {
      await updateReward({
        id: currentReward.id,
        data: formData,
      }).unwrap();
      setIsEditModalOpen(false);
      setCurrentReward(null);
      refetchRewards();
    } catch (error) {
      console.error("Failed to update reward:", error);
    }
  };

  const handleDeleteClick = (reward: Reward) => {
    setCurrentReward(reward);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentReward) {
      try {
        await deleteReward(currentReward.id).unwrap();
        refetchRewards();
      } catch (error) {
        console.error("Failed to delete reward:", error);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  // Reward Form component for both add and edit
  const RewardForm = ({
    onSubmit,
    mode,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    mode: "add" | "edit";
  }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-turquoise-50 to-white p-5 rounded-lg shadow-sm mb-6">
        <div className="text-sm text-gray-500 mb-4">
          {mode === "add" ? "Creating a new reward" : "Updating reward details"}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the reward details, conditions, exclusions, etc."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
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
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
          {image && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Selected file: {image.name}
              </p>
            </div>
          )}
          {currentReward?.image && !image && mode === "edit" && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current image:</p>
              <img
                src={currentReward.image}
                alt={currentReward.title}
                className="mt-1 h-20 w-auto object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-turquoise-50 to-white p-5 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Reward Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Required
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
                value={pointsRequired}
                onChange={(e) => setPointsRequired(Number(e.target.value))}
              />
            </div>
            {errors.pointsRequired && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pointsRequired}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Conditional fields based on selected category */}
        {category === "Discount" && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                max="100"
                className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
            {errors.discountPercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discountPercentage}
              </p>
            )}
          </div>
        )}

        {category === "Gift" && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              required
              className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-turquoise-500 focus:ring focus:ring-turquoise-200 focus:ring-opacity-50 transition-all"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className="text-red-500 text-sm mt-1">{errors.eventId}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={() =>
            mode === "add"
              ? setIsAddModalOpen(false)
              : setIsEditModalOpen(false)
          }
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
              Add Reward
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
              Update Reward
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-turquoise-700"
        >
          Add New Reward
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search rewards by title or description..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-turquoise-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Points Range
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.minPoints}
                    onChange={(e) =>
                      setFilters({ ...filters, minPoints: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                    value={filters.maxPoints}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPoints: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoadingRewards ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-turquoise-500"></div>
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No rewards found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRewards.map((reward) => (
                <tr
                  key={reward.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRewardClick(reward)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <span className="text-gray-900 font-medium">
                        {reward.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-turquoise-100 text-turquoise-800">
                      {reward.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reward.pointsRequired} points
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div
                      className="flex space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="text-turquoise-600 hover:text-turquoise-900"
                        onClick={() => handleOpenEditModal(reward)}
                        title="Edit Reward"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(reward)}
                        title="Delete Reward"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredRewards.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div>
            <p className="text-gray-600">
              Showing {indexOfFirstReward + 1} to{" "}
              {Math.min(indexOfLastReward, filteredRewards.length)} of{" "}
              {filteredRewards.length} rewards
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-turquoise-600 text-white hover:bg-turquoise-700"
              }`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-turquoise-600 text-white hover:bg-turquoise-700"
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal for Add Reward */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Reward"
      >
        <RewardForm onSubmit={handleAddReward} mode="add" />
      </Modal>

      {/* Modal for Edit Reward */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Reward"
      >
        <RewardForm onSubmit={handleEditReward} mode="edit" />
      </Modal>

      {/* Modal for Reward Details */}
      <Modal
        isOpen={isRewardDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title="Reward Details"
      >
        {currentReward && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <img
                  src={currentReward.image}
                  alt={currentReward.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="w-full md:w-2/3">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {currentReward.title}
                    </h3>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Category
                          </p>
                          <p className="text-sm text-gray-900">
                            {currentReward.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Points Required
                          </p>
                          <p className="text-sm text-gray-900">
                            {currentReward.pointsRequired} points
                          </p>
                        </div>

                        {/* Show discount percentage if category is Discount */}
                        {currentReward.category === "Discount" &&
                          currentReward.discountPercentage && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Discount Percentage
                              </p>
                              <p className="text-sm text-gray-900">
                                {currentReward.discountPercentage}%
                              </p>
                            </div>
                          )}

                        {/* Show event information if available */}
                        {currentReward.category === "Gift" &&
                          currentReward.eventId && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Event
                              </p>
                              <p className="text-sm text-gray-900">
                                {events.find(
                                  (e) => e.id === currentReward.eventId
                                )?.title || "Unknown Event"}
                              </p>
                            </div>
                          )}

                        {currentReward.createdAt && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Created At
                            </p>
                            <p className="text-sm text-gray-900">
                              {new Date(
                                currentReward.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {currentReward.updatedAt && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Last Updated
                            </p>
                            <p className="text-sm text-gray-900">
                              {new Date(
                                currentReward.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      Description
                    </h4>
                    <div className="bg-gradient-to-r from-turquoise-50 to-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {currentReward.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      onClick={handleCloseDetailsModal}
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 bg-turquoise-600 text-white rounded-md hover:bg-turquoise-700"
                      onClick={() => {
                        handleCloseDetailsModal();
                        handleOpenEditModal(currentReward);
                      }}
                    >
                      Edit Reward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete the reward "${currentReward?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default RewardsManagement;
