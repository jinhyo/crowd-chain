import { createSlice, createSelector } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userSlice",
  initialState: {
    loginUser: null,
    userLoading: true,
  },

  reducers: {
    setLoginUser: (state, { payload: loginUser }) => {
      state.loginUser = loginUser;
      state.userLoading = false;
    },
    clearLoginUser: (state) => {
      state.loginUser = null;
      state.userLoading = false;
    },
  },
});

const selectLoginUserID = createSelector(
  (state) => state.loginUser && state.loginUser.id,

  (loginUserID) => loginUserID
);

const selectLoginUser = createSelector(
  (state) => state.loginUser,

  (loginUser) => loginUser
);

const selectUserLoading = createSelector(
  (state) => state.userLoading,

  (userLoading) => userLoading
);

export const USER = userSlice.name;
export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;

export const userSelector = {
  loginUserID: (state) => selectLoginUserID(state[USER]),
  loginUser: (state) => selectLoginUser(state[USER]),
  userLoading: (state) => selectUserLoading(state[USER]),
};
