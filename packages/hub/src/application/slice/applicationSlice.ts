import {
  createAction,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { ChainNameEnum, NetworkApi, WalletApi } from '@thepowereco/tssdk';

interface ApplicationDataState {
  testnetAvailable: boolean;
  showUnderConstruction: boolean;
  networkApi: Draft<NetworkApi> | null;
  walletApi: Draft<WalletApi> | null;
  currentChain: string;
}

const SLICE_NAME = 'applicationData';

const initialState: ApplicationDataState = {
  testnetAvailable: false,
  showUnderConstruction: false,
  networkApi: null,
  walletApi: null,
  currentChain: ChainNameEnum.hundredAndThree,
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
    setShowUnderConstruction: (state: ApplicationDataState, action: PayloadAction<boolean>) => {
      state.showUnderConstruction = action.payload;
    },
    setCurrentChain: (state: ApplicationDataState, action: PayloadAction<ChainNameEnum>) => {
      state.currentChain = action.payload.toString();
    },
  },
});

export const initApplication = createAction(`${SLICE_NAME}/initApplication`);

export const {
  reducer: applicationDataReducer,
  actions: {
    setDynamicApis,
    setTestnetAvailable,
    setShowUnderConstruction,
    setCurrentChain,
  },
} = applicationDataSlice;
