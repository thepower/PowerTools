import { createSlice, createAction } from '@reduxjs/toolkit';
import { NullableUndef } from '../../typings/common';

const importAccountFromFile = createAction<NullableUndef<File>>('IMPORT_ACCOUNT');

const initialState = {};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
});

const {
  reducer: accountReducer,
} = accountSlice;

export {
  accountReducer,
  importAccountFromFile,
};
