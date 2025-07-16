import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";

// ------------------
// Types
// ------------------

export interface ManifestoItem {
  title: string;
}

export interface Leader {
  county?: string;
  constituency?: string;
  ward?: string;
  _id?: string;
  name: string;
  position: "president" | "governor" | "mp" | "mca";
  level: "country" | "county" | "constituency" | "ward";
  manifesto: ManifestoItem[];
  createdBy?: {
    firstName: string;
    email: string;
  };
}

interface LeaderState {
  leaders: Leader[];
  loading: boolean;
  error: string | null;
}

// ------------------
// Initial State
// ------------------

const initialState: LeaderState = {
  leaders: [],
  loading: false,
  error: null,
};

// ------------------
// Async Thunks
// ------------------

export const fetchLeaders = createAsyncThunk<
  Leader[],
  void,
  { state: RootState; rejectValue: string }
>("leaders/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.token;

    const response = await axios.get(
      "http://localhost:5000/api/leaders/getLeaders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch leaders"
    );
  }
});

export const createLeader = createAsyncThunk<
  Leader,
  Leader,
  { state: RootState; rejectValue: string }
>("leaders/create", async (leaderData, { getState, rejectWithValue }) => {
  try {
    const state: RootState = getState();
    const token = state.auth.token;

    const response = await axios.post(
      "http://localhost:5000/api/leaders",
      leaderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("response", response);
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create leader"
    );
  }
});

export const updateLeader = createAsyncThunk<
  Leader,
  { id: string; data: Partial<Leader> },
  { state: RootState; rejectValue: string }
>("leaders/update", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;

   const response = await axios.put(
  `http://localhost:5000/api/leaders/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.leader;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update leader"
    );
  }
});

// ------------------
// Slice
// ------------------

const leaderSlice = createSlice({
  name: "leaders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchLeaders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLeaders.fulfilled,
        (state, action: PayloadAction<Leader[]>) => {
          state.loading = false;
          state.leaders = action.payload;
        }
      )
      .addCase(fetchLeaders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching leaders";
      })

      // Create
      .addCase(createLeader.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createLeader.fulfilled,
        (state, action: PayloadAction<Leader>) => {
          state.loading = false;
          state.leaders.push(action.payload);
        }
      )
      .addCase(createLeader.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating leader";
      })

      // Update
      .addCase(updateLeader.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateLeader.fulfilled,
        (state, action: PayloadAction<Leader>) => {
          state.loading = false;
          const index = state.leaders.findIndex(
            (l) => l._id === action.payload._id
          );
          if (index !== -1) {
            state.leaders[index] = action.payload;
          }
        }
      )
      .addCase(updateLeader.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating leader";
      });
  },
});

export default leaderSlice.reducer;
