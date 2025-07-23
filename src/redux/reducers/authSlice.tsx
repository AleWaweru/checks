import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  county: string;
  constituency: string;
  ward: string;
  role?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  users: User[] | null; // Added to store list of users
  loading: boolean;
  error: string | null;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  county: string;
  constituency: string;
  ward: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  users: null, // Initialize users as null
  loading: false,
  error: null,
};

// Thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterPayload, thunkAPI) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        userData
      );
      return { message: res.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginPayload, thunkAPI) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        loginData
      );
      return { user: res.data.user, token: res.data.token };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const token = state.auth.token; // Access token from auth state

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/allUsers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Users:", res.data.users);
      return res.data.users; // Return array of users
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.users = null; // Clear users on logout
      state.loading = false;
      state.error = null;
    },
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Store fetched users
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;