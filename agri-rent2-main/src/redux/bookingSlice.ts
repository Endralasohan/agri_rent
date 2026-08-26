import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { extractError } from '../utils/apiError';
import type { Booking } from '../types';

type BookingState = {
  list: Booking[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
};

type CreateBookingPayload = {
  equipmentId: string;
  startDate: string;
  endDate: string;
};

const initialState: BookingState = {
  list: [],
  status: 'idle',
  error: null,
};

export const createBooking = createAsyncThunk<Booking, CreateBookingPayload>(
  'booking/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ booking: Booking }>('/booking', payload);
      return data.booking;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchMyBookings = createAsyncThunk<Booking[]>(
  'booking/myBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ bookings: Booking[] }>('/booking/my-bookings');
      return data.bookings;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const updateBookingStatus = createAsyncThunk<Booking, { id: string; status: Booking['status'] }>(
  'booking/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<{ booking: Booking }>(
        `/booking/${id}/status`,
        { status }
      );
      return data.booking;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const cancelBooking = createAsyncThunk<Booking, string>(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<{ booking: Booking }>(`/booking/${id}/cancel`);
      return data.booking;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = [action.payload, ...state.list];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.list = state.list.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.list = state.list.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
