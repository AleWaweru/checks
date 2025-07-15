
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import StarRatings from "react-star-ratings";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getManifestoTopics } from "./manifestoTopic";

interface ManifestoItem {
  title: string;
  description?: string;
}

interface Leader {
  _id?: string;
  name: string;
  position: string;
  level: string;
  manifesto: ManifestoItem[];
}

interface Props {
  leader: Leader;
}

const sentimentMap: Record<number, string> = {
  4: "Excellent",
  3: "Good",
  2: "Average",
  1: "Poor",
};

const LeaderReview: React.FC<Props> = ({ leader }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Load existing review (if any)
  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!leader?._id || !user?._id) return;

      setSubmitted(false);
      setRatings({});

      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/${leader._id}`);
        const existingReview = res.data.find((r: any) => r.userId._id === user._id);

        if (existingReview) {
          setSubmitted(true);
          setRatings(existingReview.ratings);
        }
      } catch (error) {
        console.error("Failed to check for existing review:", error);
      }
    };

    fetchExistingReview();
  }, [leader._id, user?._id]);

  const handleRatingChange = (title: string, rating: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [title]: rating,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/reviews", {
        leaderId: leader._id,
        userId: user?._id,
        ratings,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const manifestoTopics = getManifestoTopics(leader.level);

  return (
 <div className="bg-white p-4 sm:p-6 rounded shadow mt-8 w-full max-w-3xl mx-auto">
  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center sm:text-left">
    Rate {leader.name}'s Manifesto Performance
  </h3>

  {!submitted ? (
    <>
      {manifestoTopics.map((title) => (
        <div key={title} className="mb-5">
          <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-1 sm:gap-4">
            <strong className="text-sm sm:text-base">{title}</strong>
            <span className="text-xs sm:text-sm text-gray-500">
              {ratings[title] > 0 ? sentimentMap[ratings[title]] : "Not rated"}
            </span>
          </div>
          <StarRatings
            rating={ratings[title] || 0}
            changeRating={(val: number) => handleRatingChange(title, val)}
            numberOfStars={5}
            name={title}
            starDimension="26px"
            starSpacing="4px"
            starRatedColor="#facc15"
            starEmptyColor="#e5e7eb"
          />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={Object.keys(ratings).length === 0}
        className={`mt-6 w-full py-2 rounded font-semibold text-white transition ${
          Object.keys(ratings).length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#007E66] hover:bg-[#005F52]"
        }`}
      >
        Submit Review
      </button>
    </>
  ) : (
    <div className="text-center">
      <p className="text-sm text-green-600 mt-2">
        You have already submitted a review for this leader.
      </p>
      <div className="mt-4">
        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
          Your Ratings
        </h4>
        {manifestoTopics.map((title) => (
          <div key={title} className="mb-4 text-left">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-1 gap-1 sm:gap-4">
              <strong className="text-sm sm:text-base">{title}</strong>
              <span className="text-xs sm:text-sm text-gray-500">
                {ratings[title] > 0
                  ? `${sentimentMap[ratings[title]]} (${ratings[title]}/5)`
                  : "Not rated"}
              </span>
            </div>
            <StarRatings
              rating={ratings[title] || 0}
              numberOfStars={5}
              starDimension="24px"
              starSpacing="3px"
              starRatedColor="#facc15"
              starEmptyColor="#e5e7eb"
              name={`rated-${title}`}
              changeRating={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  )}
</div>

  );
};

export default LeaderReview;
