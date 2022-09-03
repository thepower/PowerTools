import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateAccountStepsEnum, LoginRegisterAccountTabs } from '../typings/registrationTypes';
import { Maybe } from '../../typings/common';

const SLICE_NAME = 'registration';

const generateSeedPhrase = createAction(`${SLICE_NAME}/generateSeedPhrase`);
const createWallet = createAction<string>(`${SLICE_NAME}/createWallet`);

export type RegistrationState = {
  tab: LoginRegisterAccountTabs;
  currentShard: Maybe<number>;
  seedPhrase: Maybe<string>;
  creatingStep: CreateAccountStepsEnum;
};

const initialState: RegistrationState = {
  tab: LoginRegisterAccountTabs.create,
  currentShard: null,
  seedPhrase: null,
  creatingStep: CreateAccountStepsEnum.selectSubChain,
};

export type SetSeedPhraseInput = {
  seedPhrase: string;
  nextStep: CreateAccountStepsEnum;
}

const registrationSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setCurrentRegisterCreateAccountTab: (state: RegistrationState, action: PayloadAction<LoginRegisterAccountTabs>) => {
      state.tab = action.payload;
    },
    setCreatingCurrentShard: (state: RegistrationState, action: PayloadAction<Maybe<number>>) => {
      state.currentShard = action.payload;
    },
    setSeedPhrase: (state: RegistrationState, action: PayloadAction<SetSeedPhraseInput>) => {
      state.seedPhrase = action.payload.seedPhrase;
      state.creatingStep = action.payload.nextStep;
    },
    setCreatingStep: (state: RegistrationState, action: PayloadAction<CreateAccountStepsEnum>) => {
      state.creatingStep = action.payload;
    },
  },
});

const {
  reducer: registrationReducer,
  actions: {
    setCurrentRegisterCreateAccountTab,
    setCreatingCurrentShard,
    setSeedPhrase,
    setCreatingStep,
  },
} = registrationSlice;

export {
  registrationReducer,
  setCurrentRegisterCreateAccountTab,
  setCreatingCurrentShard,
  generateSeedPhrase,
  setSeedPhrase,
  setCreatingStep,
  createWallet,
};
