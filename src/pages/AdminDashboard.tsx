import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/reducers/authSlice";
import { fetchLeaders, updateLeader } from "../redux/reducers/leadersSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Menu, X } from "lucide-react";

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
  if (!user) {
    navigate("/login");
    return;
  }

  if (user.role !== "admin") {
    navigate("/home");
    return;
  }

  dispatch(fetchLeaders());
}, [dispatch, user, navigate]);


  const getParam = (key: string) => searchParams.get(key) || "";
  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
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

  const handleSave = (id: string) => {
    if (editedName.trim() !== "") {
      const confirmed = window.confirm(
        "Are you sure you want to save changes?"
      );
      if (confirmed) {
        dispatch(updateLeader({ id, data: { name: editedName } }));
      }
    }
    setEditId(null);
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
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-white shadow-md p-4 z-10 h-full md:h-auto`}
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
              className={`text-left px-2 py-1 rounded capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {tab === "mp" ? "Members of Parliament" : tab.toUpperCase() + "s"}
            </button>
          ))}
          <button
            onClick={() => navigate("/createLeader")}
            className="text-left px-2 py-1 rounded text-green-700 hover:bg-gray-100 font-medium"
          >
            ➕ Create Leader
          </button>
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="text-left px-2 py-1 rounded text-red-500 hover:bg-gray-100"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 capitalize">
          {activeTab === "mp"
            ? "Members of Parliament"
            : activeTab.toUpperCase() + "s"}
        </h1>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="text-gray-600">County: </label>
            <select
              value={getParam("county")}
              onChange={(e) => setParam("county", e.target.value)}
              className="ml-2 border px-2 py-1 rounded"
            >
              <option value="">All</option>
              {uniqueCounties.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          {activeTab !== "governor" && (
            <div>
              <label className="text-gray-600">Constituency: </label>
              <select
                value={getParam("constituency")}
                onChange={(e) => setParam("constituency", e.target.value)}
                className="ml-2 border px-2 py-1 rounded"
              >
                <option value="">All</option>
                {uniqueConstituencies.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}
          {activeTab === "mca" && (
            <div>
              <label className="text-gray-600">Ward: </label>
              <select
                value={getParam("ward")}
                onChange={(e) => setParam("ward", e.target.value)}
                className="ml-2 border px-2 py-1 rounded"
              >
                <option value="">All</option>
                {uniqueWards.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-gray-600">Loading leaders...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredLeaders.length > 0 ? (
          <div className="bg-white border rounded shadow-sm overflow-x-auto">
            <div className="grid grid-cols-7 font-semibold text-sm text-gray-700 bg-gray-100 p-3 border-b">
              <span>#</span>
              <span>Name</span>
              <span>Position</span>
              <span>County</span>
              {activeTab !== "governor" && <span>Constituency</span>}
              {activeTab === "mca" && <span>Ward</span>}
              <span>Action</span>
            </div>

            {paginatedLeaders.map((leader, index) => (
              <div
                key={leader._id}
                className="grid grid-cols-1 md:grid-cols-7 gap-y-2 md:gap-y-0 items-start md:items-center text-sm text-gray-800 p-3 border-b"
              >
                <span className="font-semibold md:hidden">#</span>
                <span>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>

                <span className="font-semibold md:hidden">Name</span>
                {editId === leader._id ? (
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  <span>{leader.name}</span>
                )}

                <span className="font-semibold md:hidden">Position</span>
                <span className="capitalize">{leader.position}</span>

                <span className="font-semibold md:hidden">County</span>
                <span>{leader.county || "-"}</span>

                {activeTab !== "governor" && (
                  <>
                    <span className="font-semibold md:hidden">
                      Constituency
                    </span>
                    <span>{leader.constituency || "-"}</span>
                  </>
                )}

                {activeTab === "mca" && (
                  <>
                    <span className="font-semibold md:hidden">Ward</span>
                    <span>{leader.ward || "-"}</span>
                  </>
                )}

                <span className="font-semibold md:hidden">Action</span>
                <span>
                  {editId === leader._id ? (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleSave(leader._id!)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(leader._id!, leader.name)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No {activeTab}s available.</p>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === i + 1 ? "bg-gray-300" : "hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
