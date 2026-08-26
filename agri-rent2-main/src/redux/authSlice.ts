import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { clearSession, loadSession, saveSession } from '../utils/storage';
import { extractError } from '../utils/apiError';
import type { User } from '../types';

type AuthPayload = {
  token: string;
  user: User;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'farmer' | 'owner';
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  password?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  bootstrapped: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  bootstrapped: false,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  return loadSession();
});

export const login = createAsyncThunk<AuthPayload, LoginPayload>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthPayload>('/auth/login', payload);
      await saveSession(data.token, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const register = createAsyncThunk<AuthPayload, RegisterPayload>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthPayload>('/auth/register', payload);
      await saveSession(data.token, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const updateProfile = createAsyncThunk<AuthPayload, UpdateProfilePayload>(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put<{ user: User }>('/auth/profile', payload);
      const session = await loadSession();
      const token = session.token || '';
      const response = { token, user: data.user };
      if (token) {
        await saveSession(token, data.user);
      }
      return response;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
