/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { createLeader } from "../../redux/reducers/leadersSlice";
import { RegionalData } from "../../utils/Regions/KenyanRegions";
import { Link, useNavigate } from "react-router-dom";
import { getManifestoTopics } from "./manifestoTopic";
import toast from "react-hot-toast";

const CreateLeaderForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("county");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [loading, setLoading] = useState(false); // Add this


  const navigate = useNavigate();
  const handlePositionChange = (pos: string) => {
    setPosition(pos);
    setSelectedCounty("");
    setSelectedConstituency("");
    setSelectedWard("");

    if (pos === "governor") setLevel("county");
    else if (pos === "mp") setLevel("constituency");
    else if (pos === "mca") setLevel("ward");
    else setLevel("country");
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true); 

  const manifesto = getManifestoTopics(level).map((title) => ({ title }));

  const payload = {
    name,
    position: position as "president" | "governor" | "mp" | "mca",
    level: level as "country" | "county" | "constituency" | "ward",
    manifesto,
    ...(position === "governor" && { county: selectedCounty }),
    ...(position === "mp" && {
      county: selectedCounty,
      constituency: selectedConstituency,
    }),
    ...(position === "mca" && {
      county: selectedCounty,
      constituency: selectedConstituency,
      ward: selectedWard,
    }),
  };

  try {
    await dispatch(createLeader(payload)).unwrap();
    toast.success("Leader created successfully!");
    setName("");
    setPosition("");
    setLevel("county");
    setSelectedCounty("");
    setSelectedConstituency("");
    setSelectedWard("");
    navigate("/admin");
  } catch (err: any) {
    if (err?.message?.includes("Leader already exists")) {
      alert("Leader already exists for this region and position.");
    } else {
      alert(err.message || "Failed to create leader");
    }
  } finally {
    setLoading(false); // Hide loader
  }
};


  const constituencies = selectedCounty
    ? RegionalData.find((c) => c.county === selectedCounty)?.constituencies ||
      []
    : [];

  const wards = selectedConstituency
    ? constituencies.find((c) => c.name === selectedConstituency)?.wards || []
    : [];

  return (
    <div className="bg-white p-8 shadow rounded-md w-full max-w-xl mx-auto mt-10">
      <Link
        to="/admin"
        className="inline-block bg-[#007E66] text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200 shadow"
      >
        Home
      </Link>

      <h2 className="text-xl font-bold mb-6 text-[#007E66] text-center">
        Create Leader Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Leader Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <select
            className="mt-1 block w-full border rounded px-3 py-2"
            value={position}
            onChange={(e) => handlePositionChange(e.target.value)}
            required
          >
            <option value="">Select Position</option>
            <option value="president">President</option>
            <option value="governor">Governor</option>
            <option value="mp">MP</option>
            <option value="mca">MCA</option>
          </select>
        </div>

        {/* Region Selectors */}
        {(position === "governor" ||
          position === "mp" ||
          position === "mca") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              County
            </label>
            <select
              value={selectedCounty}
              onChange={(e) => {
                setSelectedCounty(e.target.value);
                setSelectedConstituency("");
                setSelectedWard("");
              }}
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select County</option>
              {RegionalData.map((county) => (
                <option key={county.countyCode} value={county.county}>
                  {county.county}
                </option>
              ))}
            </select>
          </div>
        )}

        {(position === "mp" || position === "mca") && selectedCounty && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Constituency
            </label>
            <select
              value={selectedConstituency}
              onChange={(e) => {
                setSelectedConstituency(e.target.value);
                setSelectedWard("");
              }}
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select Constituency</option>
              {constituencies.map((c) => (
                <option key={c.constituencyCode} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {position === "mca" && selectedConstituency && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select Ward</option>
              {wards.map((w) => (
                <option key={w.wardCode} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Manifesto Preview */}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-[#007E66] mb-2">
            Manifesto Topics
          </label>
          {getManifestoTopics(level).map((topic) => (
            <input
              key={topic}
              type="text"
              value={topic}
              disabled
              className="w-full mb-2 border rounded px-3 py-2 bg-gray-100 text-gray-700"
            />
          ))}
        </div>

      <button
  type="submit"
  disabled={loading}
  className={`w-full py-2 px-4 rounded font-semibold transition duration-200 ${
    loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007E66] hover:bg-[#006655] text-white"
  }`}
>
  {loading ? "Creating..." : "Create Leader"}
</button>

      </form>
    </div>
  );
};

export default CreateLeaderForm;
