import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/reducers/authSlice";
import {
  deleteLeader,
  fetchLeaders,
  updateLeader,
} from "../redux/reducers/leadersSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector((state: RootState) => state.auth.user);
  const { leaders, loading, error } = useSelector(
    (state: RootState) => state.leaders
  );

  const [activeTab, setActiveTab] = useState("governor");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
  const fetchData = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/home");
    await dispatch(fetchLeaders());
  };
  fetchData();
}, [dispatch, user, navigate]);

  const getParam = (key: string) => searchParams.get(key) || "";
  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams);
  };

  const groupedLeaders = {
    governor: leaders.filter((l) => l.position === "governor"),
    mp: leaders.filter((l) => l.position === "mp"),
    mca: leaders.filter((l) => l.position === "mca"),
  };

  const filteredLeaders = groupedLeaders[activeTab].filter((leader) => {
    const countyMatch = getParam("county")
      ? leader.county === getParam("county")
      : true;
    const constituencyMatch = getParam("constituency")
      ? leader.constituency === getParam("constituency")
      : true;
    const wardMatch = getParam("ward")
      ? leader.ward === getParam("ward")
      : true;
    return countyMatch && constituencyMatch && wardMatch;
  });

  const paginatedLeaders = filteredLeaders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredLeaders.length / ITEMS_PER_PAGE);

  const handleEdit = (id: string, name: string) => {
    setEditId(id);
    setEditedName(name);
  };

  const handleSave = async (id: string) => {
    if (!editedName.trim()) return;

    toast.promise(
      dispatch(updateLeader({ id, data: { name: editedName } }))
        .unwrap()
        .then(() => setEditId(null)),
      {
        loading: "Saving changes...",
        success: "Leader updated successfully!",
        error: (err) => err || "Failed to update leader",
      }
    );
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <span>
        Confirm delete?
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.promise(dispatch(deleteLeader(id)).unwrap(), {
                loading: "Deleting...",
                success: "Leader deleted successfully!",
                error: (err) => err || "Failed to delete leader",
              });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 text-xs rounded"
          >
            Cancel
          </button>
        </div>
      </span>
    ));
  };

  const extractUnique = (field: keyof (typeof leaders)[0]) =>
    Array.from(new Set(groupedLeaders[activeTab].map((l) => l[field]))).filter(
      Boolean
    ) as string[];

  const uniqueCounties = extractUnique("county");
  const uniqueConstituencies = extractUnique("constituency");
  const uniqueWards = extractUnique("ward");

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-sm">
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`$${isSidebarOpen ? "block" : "hidden"} md:block w-full md:w-64 bg-white shadow-md p-4 z-10 h-full`}
      >
        <nav className="flex flex-col gap-3">
          {["governor", "mp", "mca"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
                setSearchParams({});
                setSidebarOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-md transition-all duration-200 capitalize font-medium ${
                activeTab === tab
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              {tab === "mp" ? "Members of Parliament" : tab.toUpperCase() + "s"}
            </button>
          ))}

          <button
            onClick={() => navigate("/createLeader")}
            className="text-left px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            ➕ Create Leader
          </button>

          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="text-left px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-6 capitalize">
          {activeTab === "mp"
            ? "Members of Parliament"
            : activeTab.toUpperCase() + "s"}
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={getParam("county")}
            onChange={(e) => setParam("county", e.target.value)}
            className="border px-3 py-2 rounded-md text-sm"
          >
            <option value="">All Counties</option>
            {uniqueCounties.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {activeTab !== "governor" && (
            <select
              value={getParam("constituency")}
              onChange={(e) => setParam("constituency", e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            >
              <option value="">All Constituencies</option>
              {uniqueConstituencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}

          {activeTab === "mca" && (
            <select
              value={getParam("ward")}
              onChange={(e) => setParam("ward", e.target.value)}
              className="border px-3 py-2 rounded-md text-sm"
            >
              <option value="">All Wards</option>
              {uniqueWards.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredLeaders.length === 0 ? (
          <p className="text-gray-500">No {activeTab}s found.</p>
        ) : (
          <div className="border rounded-md shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">County</th>
                  {activeTab !== "governor" && <th className="px-4 py-2">Constituency</th>}
                  {activeTab === "mca" && <th className="px-4 py-2">Ward</th>}
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaders.map((leader, idx) => (
                  <tr key={leader._id} className="border-t">
                    <td className="px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td className="px-4 py-2">
                      {editId === leader._id ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        leader.name
                      )}
                    </td>
                    <td className="px-4 py-2 capitalize">{leader.position}</td>
                    <td className="px-4 py-2">{leader.county || "-"}</td>
                    {activeTab !== "governor" && (
                      <td className="px-4 py-2">{leader.constituency || "-"}</td>
                    )}
                    {activeTab === "mca" && (
                      <td className="px-4 py-2">{leader.ward || "-"}</td>
                    )}
                    <td className="px-4 py-2">
                      {editId === leader._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(leader._id!)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(leader._id!, leader.name)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(leader._id!)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === page
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
