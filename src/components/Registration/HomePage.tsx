import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Text,
  Cell,
} from "recharts";
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../redux/reducers/authSlice";
import { fetchLeaders } from "../../redux/reducers/leadersSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import LeaderReview from "./reviewLeader";
import { getManifestoTopics } from "./manifestoTopic";

const levels = ["country", "county", "constituency", "ward"] as const;
type Level = (typeof levels)[number];

interface Leader {
  _id: string;
  name: string;
  position: string;
  level: Level;
  county?: string;
  constituency?: string;
  ward?: string;
  manifesto: { title: string }[];
  averageRating: number;
  totalReviews?: number;
}

const Homepage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userProfile = useSelector((state: RootState) => state.auth.user);

  const [selectedLevel, setSelectedLevel] = useState<Level>("country");
  const [globalLeaders, setGlobalLeaders] = useState<Leader[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [averageScores, setAverageScores] = useState<Record<string, number>>(
    {}
  );
  const [averageScore, setAverageScore] = useState<number>(0);
  const [manifestoChartData, setManifestoChartData] = useState<
    {
      fill: string | undefined;
      title: string;
      percentage: number;
    }[]
  >([]);

  useEffect(() => {
    dispatch(fetchLeaders());
  }, [dispatch]);

  useEffect(() => {
    const fetchGlobalPerformance = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/leaders/performance"
        );
        const data = await res.json();
        setGlobalLeaders(data);
      } catch (err) {
        console.error("Failed to fetch leader performance:", err);
      }
    };

    const fetchAllReviews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reviews/allReviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch all reviews:", err);
      }
    };

    fetchGlobalPerformance();
    fetchAllReviews();
  }, []);

  const filteredLeaders = useMemo(() => {
    return globalLeaders.filter((leader) => {
      if (leader.level !== selectedLevel) return false;

      if (selectedLevel === "country") {
        return leader.position === "president";
      }

      if (!userProfile) return false;

      if (selectedLevel === "county") {
        return (
          leader.county === userProfile.county && leader.position === "governor"
        );
      }

      if (selectedLevel === "constituency") {
        return (
          leader.county === userProfile.county &&
          leader.constituency === userProfile.constituency &&
          leader.position === "mp"
        );
      }

      if (selectedLevel === "ward") {
        return (
          leader.county === userProfile.county &&
          leader.constituency === userProfile.constituency &&
          leader.ward === userProfile.ward &&
          leader.position === "mca"
        );
      }

      return false;
    });
  }, [globalLeaders, selectedLevel, userProfile]);

  const currentLeader = filteredLeaders.length > 0 ? filteredLeaders[0] : null;

  useEffect(() => {
    if (!currentLeader || !currentLeader.manifesto) return;

    const avgScores: Record<string, number> = {};
    const chartData = getManifestoTopics(currentLeader.level).map((title) => {
      const titleStr = String(title);
      const scores = reviews
        .filter((r) => r.leaderId === currentLeader._id)
        .map((r) => r?.ratings?.[titleStr])
        .filter((s) => typeof s === "number") as number[];

      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      const roundedAvg = parseFloat(avg.toFixed(1));
      const percentage = parseFloat(((avg / 4) * 100).toFixed(1));

      avgScores[titleStr] = roundedAvg;

      // Assign color based on percentage
      let color = "#dc2626"; // Poor
      if (percentage >= 75) color = "#16a34a"; // Excellent
      else if (percentage >= 50) color = "#3b82f6"; // Good
      else if (percentage >= 25) color = "#facc15"; // Average

      return {
        title: titleStr,
        percentage,
        fill: color,
      };
    });

    setAverageScores(avgScores);
    setManifestoChartData(chartData);

    const allScores = chartData.map((d) => (d.percentage / 100) * 4);
    const total = allScores.reduce((a, b) => a + b, 0);
    const avg = total / allScores.length || 0;
    setAverageScore(parseFloat(avg.toFixed(2)));
  }, [currentLeader, reviews]);

  const getTopLeadersByPosition = (position: string) => {
    const leaders = globalLeaders.filter((l) => l.position === position);

    return leaders
      .map((leader) => {
        const leaderReviews = reviews.filter((r) => r.leaderId === leader._id);
        const ratings = leaderReviews.flatMap((r) =>
          Object.values(r.ratings || {}).filter(
            (val): val is number => typeof val === "number"
          )
        );

        const average =
          ratings.length > 0
            ? parseFloat(
                (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
              )
            : 0;

        return {
          ...leader,
          averageRating: average,
        };
      })
      .filter((l) => l.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 20);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <Text
        x={x}
        y={y}
        dy={16}
        textAnchor="end"
        angle={-30}
        fontSize={10}
        fill="#4B5563"
      >
        {payload.value}
      </Text>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#007E66]">
          Welcome, {userProfile?.firstName}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/createLeader"
            className="bg-[#007E66] text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Create Leader
          </Link>
          <button
            onClick={() => {
              dispatch(logout());
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>

      <p className="mt-4 px-4 py-2 bg-gray-100 rounded-lg shadow text-gray-800 font-medium text-sm sm:text-base">
        <strong className="text-[#007E66]">Region:</strong>{" "}
        {userProfile?.county} / {userProfile?.constituency} /{" "}
        {userProfile?.ward}
      </p>

      <div className="mt-6">
        <label className="font-semibold text-sm sm:text-base mr-2">
          Select Level:
        </label>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                selectedLevel === level
                  ? "bg-[#007E66] text-white"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

   {currentLeader ? (
  <>
    <h2 className="mt-6 sm:mt-8 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
      {currentLeader.position === "president" ? (
        <>
          HE {currentLeader.name}
          <span className="font-normal text-gray-600"> (President)</span>
        </>
      ) : (
        <>
          Hon. {currentLeader.name}
          <span className="font-normal text-gray-600">
            {" "}
            ({currentLeader.position.toUpperCase()})
          </span>
        </>
      )}
    </h2>

    <div className="mt-6 sm:mt-8 w-full">
      <h3 className="text-gray-700 font-semibold text-base sm:text-lg mb-4">
        Manifesto Score Breakdown (%)
      </h3>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#dc2626]" />
          <span className="text-sm text-gray-700">Poor (0–24%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#facc15]" />
          <span className="text-sm text-gray-700">Average (25–49%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#3b82f6]" />
          <span className="text-sm text-gray-700">Good (50–74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#16a34a]" />
          <span className="text-sm text-gray-700">Excellent (75–100%)</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 xs:h-72 sm:h-80 md:h-[22rem] lg:h-[24rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={manifestoChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="title"
              tick={renderCustomTick}
              interval={0}
              height={140}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(tick) => `${tick}%`}
              tick={{ fontSize: 12, fill: "#4B5563" }}
            />
            <Tooltip formatter={(val: number) => `${val}%`} />
            <Bar dataKey="percentage" barSize={30}>
              {manifestoChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <LeaderReview leader={currentLeader} />
  </>
) : (
  <p className="mt-6 text-gray-600 text-sm sm:text-base">
    No leader available at this level.
  </p>
)}


      <div className="mt-8 sm:mt-12">
        <h3 className="text-[#007E66] text-base sm:text-lg lg:text-xl font-semibold mb-4">
          Overall Performance Score
          {currentLeader?.name && (
            <span className="text-gray-700 font-normal">
              {" "}
              – {currentLeader.name}
            </span>
          )}
        </h3>

        <div className="w-full bg-gray-200 rounded-lg overflow-hidden shadow h-5 sm:h-6">
          <div
            className="h-full text-white text-xs sm:text-sm flex items-center justify-center"
            style={{
              width: `${(averageScore / 5) * 100}%`,
              backgroundColor:
                averageScore >= 3.5
                  ? "#16a34a"
                  : averageScore >= 2.5
                  ? "#3b82f6"
                  : averageScore >= 1.5
                  ? "#facc15"
                  : "#dc2626",
            }}
          >
            {averageScore > 0 &&
              `${((averageScore / 5) * 100).toFixed(1)}% - ${
                averageScore >= 3.5
                  ? "Excellent"
                  : averageScore >= 2.5
                  ? "Good"
                  : averageScore >= 1.5
                  ? "Average"
                  : "Poor"
              }`}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm sm:text-base text-gray-600">
          <span>Average Rating:</span>
          <strong>{averageScore} / 5</strong>
          <StarRatings
            rating={averageScore}
            starRatedColor="#facc15"
            numberOfStars={5}
            starDimension="16px"
            starSpacing="1px"
            name="average-rating"
          />
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <h3 className="text-[#007E66] text-base sm:text-lg lg:text-xl font-semibold mb-4">
          Top 20 Performing Leaders Countrywide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {["governor", "mp", "mca"].map((position) => (
            <div
              key={position}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <h4 className="text-gray-700 font-semibold text-sm sm:text-base mb-3 capitalize border-b border-gray-200 pb-2">
                {position === "mp"
                  ? "Members of Parliament"
                  : position === "mca"
                  ? "MCAs"
                  : position.charAt(0).toUpperCase() + position.slice(1) + "s"}
              </h4>
              <ul className="space-y-3">
                {getTopLeadersByPosition(position).length > 0 ? (
                  getTopLeadersByPosition(position).map((leader, index) => (
                    <li
                      key={leader._id || index}
                      className="flex flex-col sm:flex-row items-start justify-between bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-full sm:w-auto">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">
                          {index + 1}. {leader.name}
                        </span>
                        <div className="text-xs sm:text-sm text-gray-500 capitalize">
                          {leader.position}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {leader.county && `County: ${leader.county}`}
                          {leader.constituency &&
                            `, Constituency: ${leader.constituency}`}
                          {leader.ward && `, Ward: ${leader.ward}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                        <span className="text-[#007E66] font-semibold text-sm sm:text-base">
                          {leader.averageRating > 0
                            ? `${leader.averageRating.toFixed(2)} / 5`
                            : "No ratings"}
                        </span>
                        <StarRatings
                          rating={leader.averageRating || 0}
                          starRatedColor="#facc15"
                          numberOfStars={5}
                          starDimension="14px"
                          starSpacing="1px"
                          name={`rating-${leader._id}`}
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 text-sm sm:text-base">
                    No rated leaders available for {position}.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
