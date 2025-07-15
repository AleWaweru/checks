/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import StarRatings from "react-star-ratings";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getManifestoTopics } from "./manifestoTopic";

// -------------------- Types --------------------
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

// -------------------- Component --------------------
const LeaderReview: React.FC<Props> = ({ leader }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<Date | null>(null);

  // -------------------- Fetch Existing Review --------------------
  const fetchExistingReview = async () => {
    if (!leader?._id || !user?._id) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/reviews/${leader._id}`
      );
      const existingReview = res.data.find(
        (r: any) => r.userId._id === user._id
      );

      if (existingReview) {
        setSubmitted(true);
        setRatings(existingReview.ratings);

        // Calculate the next allowed review date
        const reviewDate = new Date(existingReview.createdAt);
        const nextAllowedDate = new Date(reviewDate);
        nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 3);

        const now = new Date();
        if (now < nextAllowedDate) {
          setNextReviewDate(nextAllowedDate);
        } else {
          setNextReviewDate(null);
        }
      } else {
        setSubmitted(false);
        setRatings({});
        setNextReviewDate(null);
      }
    } catch (error) {
      console.error("Failed to fetch existing review:", error);
    }
  };

  useEffect(() => {
    fetchExistingReview();
  }, [leader._id, user?._id]);

  // -------------------- Rating Handler --------------------
  const handleRatingChange = (title: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [title]: rating,
    }));
  };

  // -------------------- Submit Handler --------------------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/reviews", {
        leaderId: leader._id,
        userId: user?._id,
        ratings,
      });
      setSubmitted(true);
      setNextReviewDate(null);
      fetchExistingReview(); // refresh
    } catch (error: any) {
      if (
        error.response?.status === 409 &&
        error.response?.data?.nextReviewDate
      ) {
        const date = new Date(error.response.data.nextReviewDate);
        console.log("Next review date:", date);
        setNextReviewDate(date);
        setSubmitted(true); // <-- this is the key
      } else {
        console.error("Failed to submit review:", error);
      }
    } finally {
      setLoading(false);
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
                  {ratings[title] > 0
                    ? sentimentMap[ratings[title]]
                    : "Not rated"}
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
            disabled={Object.keys(ratings).length === 0 || loading}
            className={`mt-6 w-full py-2 rounded font-semibold text-white flex items-center justify-center transition ${
              Object.keys(ratings).length === 0 || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#007E66] hover:bg-[#005F52]"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              "Submit Review"
            )}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="text-sm text-green-600 mt-2">
            You have already submitted a review for this leader.
          </p>
          {nextReviewDate && (
            <p className="mt-4 text-md text-red-500">
              You can submit your next review on{" "}
              <span className="font-medium">
                {nextReviewDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderReview;
