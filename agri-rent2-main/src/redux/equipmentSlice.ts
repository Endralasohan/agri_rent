import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';
import { extractError } from '../utils/apiError';
import type { Equipment } from '../types';

type EquipmentState = {
  list: Equipment[];
  selected: Equipment | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
};

type EquipmentQuery = {
  search?: string;
  category?: string;
  available?: boolean;
};

type EquipmentPayload = Partial<Equipment> & {
  equipmentName: string;
  category: string;
  description: string;
  pricePerDay: number;
};

const initialState: EquipmentState = {
  list: [],
  selected: null,
  status: 'idle',
  error: null,
};

export const fetchEquipment = createAsyncThunk<Equipment[], EquipmentQuery | undefined>(
  'equipment/fetchAll',
  async (query, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (query?.search) params.append('search', query.search);
      if (query?.category) params.append('category', query.category);
      if (query?.available !== undefined) {
        params.append('available', query.available ? 'true' : 'false');
      }
      const queryString = params.toString();
      const { data } = await api.get<{ equipment: Equipment[] }>(
        queryString ? `/equipment?${queryString}` : '/equipment'
      );
      return data.equipment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchEquipmentById = createAsyncThunk<Equipment, string>(
  'equipment/fetchById',
  async (equipmentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ equipment: Equipment }>(
        `/equipment/${equipmentId}`
      );
      return data.equipment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const createEquipment = createAsyncThunk<Equipment, EquipmentPayload>(
  'equipment/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ equipment: Equipment }>('/equipment', payload);
      return data.equipment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const updateEquipment = createAsyncThunk<Equipment, { id: string; payload: Partial<Equipment> }>(
  'equipment/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<{ equipment: Equipment }>(
        `/equipment/${id}`,
        payload
      );
      return data.equipment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const deleteEquipment = createAsyncThunk<string, string>(
  'equipment/delete',
  async (equipmentId, { rejectWithValue }) => {
    try {
      await api.delete(`/equipment/${equipmentId}`);
      return equipmentId;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const updateEquipmentStatus = createAsyncThunk<Equipment, { id: string; available: boolean }>(
  'equipment/updateStatus',
  async ({ id, available }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<{ equipment: Equipment }>(
        `/equipment/${id}/status`,
        { available }
      );
      return data.equipment;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    clearEquipmentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = action.payload;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.list = state.list.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.selected = action.payload;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      })
      .addCase(updateEquipmentStatus.fulfilled, (state, action) => {
        state.list = state.list.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.selected = action.payload;
      });
  },
});

export const { clearEquipmentError } = equipmentSlice.actions;
export default equipmentSlice.reducer;
