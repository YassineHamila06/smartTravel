import { useState, useEffect } from "react";
import { Search, Filter, Edit, Trash2, User as UserIcon } from "lucide-react";
import {
  useGetusersQuery,
  useDeleteuserMutation,
} from "../../services/USER-API";
import { formatDistanceToNow } from "date-fns";

const UsersManagement = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    preferences: "all",
  });

  // RTK Query hooks
  const { data: users = [], isLoading, error, refetch } = useGetusersQuery();

  const [deleteUser] = useDeleteuserMutation();

  // Log component rendering for debugging
  useEffect(() => {
    console.log("UsersManagement component rendered");
    console.log("Users data:", users);
    if (error) {
      console.error("Query error:", error);
    }
  }, [users, error]);

  // Handle user deletion
  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        alert("User deleted successfully");
      } catch (err) {
        alert("Error deleting user");
        console.error("Delete error:", err);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name} ${user.lastname}`.toLowerCase();
    if (filters.name && !fullName.includes(filters.name.toLowerCase()))
      return false;
    if (
      filters.email &&
      !user.email.toLowerCase().includes(filters.email.toLowerCase())
    )
      return false;
    if (
      filters.preferences !== "all" &&
      (!user.travelPreferences ||
        !user.travelPreferences.includes(filters.preferences))
    )
      return false;
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search users by name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-turquoise-500"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  placeholder="Filter by email"
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                  value={filters.email}
                  onChange={(e) =>
                    setFilters({ ...filters, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Travel Preferences
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                  value={filters.preferences}
                  onChange={(e) =>
                    setFilters({ ...filters, preferences: e.target.value })
                  }
                >
                  <option value="all">All Preferences</option>
                  <option value="Beach destinations">Beach destinations</option>
                  <option value="Cultural tours">Cultural tours</option>
                  <option value="Adventure travel">Adventure travel</option>
                  <option value="Nature escapes">Nature escapes</option>
                  <option value="City breaks">City breaks</option>
                  <option value="Luxury travel">Luxury travel</option>
                  <option value="Budget travel">Budget travel</option>
                  <option value="Wellness retreats">Wellness retreats</option>
                  <option value="Family vacations">Family vacations</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-turquoise-500 text-white rounded-lg hover:bg-turquoise-600"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">
              <p>
                Error loading users. Please check if the backend server is
                running.
              </p>
              <p className="text-sm mt-2">
                Technical details: {error.toString?.() || "Unknown error"}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-turquoise-500 text-white rounded-lg hover:bg-turquoise-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Preferences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profileImage}
                                alt={`${user.name} ${user.lastname}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name} {user.lastname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.travelPreferences &&
                          user.travelPreferences.length > 0 ? (
                            user.travelPreferences.map((pref, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                              >
                                {pref}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.createdAt
                            ? formatDistanceToNow(new Date(user.createdAt), {
                                addSuffix: true,
                              })
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => alert(`Edit user ${user.id}`)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
