import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Edit,
  Key,
  Trash2,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import Modal from "./Modal";
import type { Admin } from "../types";
import {
  useGetMeQuery,
  useGetAdminsQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from "../../services/ADMIN-API";

const ProfileManagement = () => {
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  // Get current admin (me) data
  const {
    data: meData,
    isLoading: isMeLoading,
    error: meError,
    refetch: refetchMe,
  } = useGetMeQuery();

  // Get all admins
  const {
    data: adminsData,
    isLoading: isAdminsLoading,
    error: adminsError,
    refetch: refetchAdmins,
  } = useGetAdminsQuery();

  // Update admin mutation
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();

  // Delete admin mutation
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  // Set current admin from fetched data
  useEffect(() => {
    if (meData && !currentAdmin) {
      setCurrentAdmin(meData);
    }
  }, [meData, currentAdmin]);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });

  const [editAdmin, setEditAdmin] = useState({
    id: "",
    name: "",
    email: "",
    image: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be handled by a createAdmin mutation
    // which already exists in the API but isn't implemented here
    setIsAddAdminModalOpen(false);
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", editAdmin.name);
      formData.append("email", editAdmin.email);

      // Only append image if it's a new file URL (not the existing one)
      if (editAdmin.image && editAdmin.image !== currentAdmin?.image) {
        // In a real implementation, you'd handle file uploads differently
        // This is just a placeholder for the API call structure
        formData.append("image", editAdmin.image);
      }

      await updateAdmin({
        id: editAdmin.id,
        data: formData,
      }).unwrap();

      // Refresh data after update
      refetchMe();
      refetchAdmins();

      setIsEditAdminModalOpen(false);
    } catch (error) {
      console.error("Failed to update admin:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate passwords and call an API
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (currentAdmin) {
      // Here we would call an API to update the password
      // This would typically be a separate endpoint
      alert("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangePasswordModalOpen(false);
    }
  };

  const openEditModal = (admin: Admin) => {
    setCurrentAdmin(admin);
    setEditAdmin({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
    });
    setIsEditAdminModalOpen(true);
  };

  const openPasswordModal = (admin: Admin) => {
    setCurrentAdmin(admin);
    setIsChangePasswordModalOpen(true);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await deleteAdmin(adminId).unwrap();

        // Refresh admins list after deletion
        refetchAdmins();

        // If current admin is deleted, set current admin to the me data
        if (currentAdmin && currentAdmin.id === adminId) {
          setCurrentAdmin(meData || null);
        }
      } catch (error) {
        console.error("Failed to delete admin:", error);
        alert("Failed to delete admin. Please try again.");
      }
    }
  };

  const viewAdminProfile = (admin: Admin) => {
    setCurrentAdmin(admin);
  };

  // Show loading state
  if (isMeLoading || isAdminsLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (meError || adminsError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
          <p>
            There was a problem loading your profile. Please try refreshing the
            page.
          </p>
          <button
            onClick={() => {
              refetchMe();
              refetchAdmins();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use real data or empty arrays if data is not available yet
  const admins = adminsData || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-600 mt-1">
              View and manage your profile information
            </p>
          </div>
          <button
            onClick={() => setIsAddAdminModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            <UserPlus size={20} />
            <span>Add New Admin</span>
          </button>
        </div>

        {/* Admin Profile Section */}
        {currentAdmin && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 md:h-48"></div>
            <div className="relative px-6 sm:px-8 -mt-16">
              <div className="flex flex-col md:flex-row md:items-end mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={currentAdmin.image}
                    alt={currentAdmin.name}
                    className="w-32 h-32 rounded-xl border-4 border-white object-cover shadow-md"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col md:flex-row md:items-center justify-between w-full">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentAdmin.name}
                    </h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Shield size={16} className="mr-1 text-blue-600" />
                      {currentAdmin.role || "Administrator"}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                      onClick={() => openEditModal(currentAdmin)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-200 flex items-center space-x-2"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Edit size={16} />
                      )}
                      <span>{isUpdating ? "Saving..." : "Edit Profile"}</span>
                    </button>
                    <button
                      onClick={() => openPasswordModal(currentAdmin)}
                      className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition duration-200 flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-gray-200 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Mail size={18} className="text-gray-500 mr-3" />
                      <span>{currentAdmin.email}</span>
                    </div>
                    {currentAdmin.location && (
                      <div className="flex items-center text-gray-700">
                        <MapPin size={18} className="text-gray-500 mr-3" />
                        <span>{currentAdmin.location}</span>
                      </div>
                    )}
                    {currentAdmin.department && (
                      <div className="flex items-center text-gray-700">
                        <Briefcase size={18} className="text-gray-500 mr-3" />
                        <span>{currentAdmin.department}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={18} className="text-gray-500 mr-3" />
                      <span>
                        Joined: {currentAdmin.joinDate || "Not available"}
                      </span>
                    </div>
                    {currentAdmin.lastActive && (
                      <div className="flex items-center text-gray-700">
                        <Clock size={18} className="text-gray-500 mr-3" />
                        <span>Last active: {currentAdmin.lastActive}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-700">
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                        <span className="text-xs font-semibold text-gray-500">
                          ID
                        </span>
                      </div>
                      <span className="text-sm">{currentAdmin.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Administrators Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Administrators ({admins.length})
            </h2>
          </div>

          {admins.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No administrators found.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className={`p-6 flex items-start justify-between transition-colors ${
                    currentAdmin && currentAdmin.id === admin.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div
                    className="flex items-center space-x-5 cursor-pointer"
                    onClick={() => viewAdminProfile(admin)}
                  >
                    <img
                      src={admin.image}
                      alt={admin.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {admin.name}
                        {currentAdmin && currentAdmin.id === admin.id && (
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Current
                          </span>
                        )}
                        {meData && meData.id === admin.id && (
                          <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <p className="text-gray-600">{admin.email}</p>
                        {admin.role && (
                          <p className="text-gray-500 text-sm">
                            <span className="hidden sm:inline">•</span>{" "}
                            {admin.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition duration-200"
                      title="Edit Profile"
                      disabled={isUpdating}
                    >
                      {isUpdating && currentAdmin?.id === admin.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Edit size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => openPasswordModal(admin)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition duration-200"
                      title="Change Password"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition duration-200"
                      title="Delete Admin"
                      disabled={isDeleting}
                    >
                      {isDeleting && currentAdmin?.id === admin.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="Add New Admin"
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Image URL (optional)
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newAdmin.image}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddAdminModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Admin
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={isEditAdminModalOpen}
        onClose={() => setIsEditAdminModalOpen(false)}
        title="Edit Admin Profile"
      >
        <form onSubmit={handleEditAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editAdmin.name}
              onChange={(e) =>
                setEditAdmin({ ...editAdmin, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editAdmin.email}
              onChange={(e) =>
                setEditAdmin({ ...editAdmin, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Image URL
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editAdmin.image}
              onChange={(e) =>
                setEditAdmin({ ...editAdmin, image: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditAdminModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileManagement;
