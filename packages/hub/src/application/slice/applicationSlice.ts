import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApplicationDataState {
  testnetAvailable: boolean;
};

const SLICE_NAME = 'applicationData';

const initApplication = createAction(`${SLICE_NAME}/initApplication`);

const initialState: ApplicationDataState = {
 testnetAvailable: false,
};

const applicationDataSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setTestnetAvailable: (state: ApplicationDataState, action: PayloadAction<boolean>) => {
      state.testnetAvailable = action.payload;
    },
  },
});

const {
  reducer: applicationDataReducer,
  actions: {
    setTestnetAvailable,
  }
} = applicationDataSlice;

export {
  applicationDataReducer,
  setTestnetAvailable,
  initApplication,
};
