import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
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
  loading: false,
  error: null,
};

// Thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterPayload, thunkAPI) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", userData);
      return { user: res.data.user, token: res.data.token };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData: LoginPayload, thunkAPI) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
      return { user: res.data.user, token: res.data.token };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
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
      state.loading = false;
      state.error = null;
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
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
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
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
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
