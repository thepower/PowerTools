import {
  createAction,
  createSlice,
  PayloadAction,
  Draft,
} from '@reduxjs/toolkit';
import { NetworkApi, WalletApi } from '@thepowereco/tssdk';

interface ApplicationDataState {
  testnetAvailable: boolean;
  networkApi: Draft<NetworkApi> | null;
  walletApi: Draft<WalletApi> | null;
}

const SLICE_NAME = 'applicationData';

const initialState: ApplicationDataState = {
  testnetAvailable: false,
  networkApi: null,
  walletApi: null,
};

const applicationDataSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setDynamicApis: (state: ApplicationDataState, { payload }: PayloadAction<{ networkApi: NetworkApi, walletApi: WalletApi }>) => {
      state.networkApi = payload.networkApi;
      state.walletApi = payload.walletApi;
    },
    setTestnetAvailable: (state: ApplicationDataState, { payload }: PayloadAction<boolean>) => {
      state.testnetAvailable = payload;
    },
  },
});

export const initApplication = createAction(`${SLICE_NAME}/initApplication`);

export const {
  reducer: applicationDataReducer,
  actions: {
    setDynamicApis,
    setTestnetAvailable,
  },
} = applicationDataSlice;
