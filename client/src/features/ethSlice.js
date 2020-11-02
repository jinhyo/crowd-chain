import { createSlice, createSelector } from "@reduxjs/toolkit";

const ethSlice = createSlice({
  name: "ethSlice",
  initialState: {
    web3State: { loading: false, done: false, error: null },
    web3Instance: null,
    contractState: {
      loading: false,
      done: false,
      error: null,
    },
    contractInstance: {
      factoryContract: null,
      campaignContract: null,
    },
    initialized: false,
    campaigns: [],
    currentAccount: "",
  },
  reducers: {
    loadWeb3Request: (state) => {
      state.web3State.loading = true;
      state.web3State.done = false;
      state.web3State.error = null;
      state.initialized = false;
    },
    loadWeb3Failure: (state, { payload: error }) => {
      state.web3State.loading = false;
      state.web3State.error = error;
    },
    loadWeb3Success: (state, { payload: web3 }) => {
      state.web3Instance = web3;
      state.web3State.loading = false;
      state.web3State.done = true;
    },

    loadFactoryContractRequest: (state) => {
      state.contractState.loading = true;
      state.contractState.done = false;
      state.contractState.error = null;
    },
    loadFactoryContractFailure: (state, { payload: error }) => {
      state.contractState.loading = false;
      state.contractState.error = error;
    },
    loadFactoryContractSuccess: (state, { payload: factoryContract }) => {
      state.contractState.loading = false;
      state.contractState.done = true;
      state.contractInstance.factoryContract = factoryContract;
      state.initialized = true;
    },

    loadCampaignContractRequest: (state) => {
      state.contractState.loading = true;
      state.contractState.done = false;
      state.contractState.error = null;
    },
    loadCampaignContractFailure: (state, { payload: error }) => {
      state.contractState.loading = false;
      state.contractState.error = error;
    },
    loadCampaignContractSuccess: (state, { payload: campaignContract }) => {
      state.contractState.loading = false;
      state.contractState.done = true;
      state.contractInstance.campaignContract = campaignContract;
    },

    saveCampaigns: (state, { payload: campaigns }) => {
      state.campaigns = campaigns;
    },
    addCampaign: (state, { payload: campaign }) => {
      state.campaigns.unshift(campaign);
    },
    setCurrentAccount: (state, { payload: account }) => {
      state.currentAccount = account;
    },
    clearCampaignContract: (state) => {
      state.contractInstance.campaignContract = null
    },
  },
});

const selectCampaignContract = createSelector(
  (state) => state.contractInstance.campaignContract,

  (contract) => contract
);

const selectWeb3 = createSelector(
  (state) => state.web3Instance,

  (web3) => web3
);

const selectAll = createSelector(
  (state) => state.initialized,
  (state) => state.web3Instance,
  (state) => state.contractInstance.factoryContract,

  (initialized, web3, factoryContract) => {
    return { initialized, web3, factoryContract };
  }
);

const selectFactoryContract = createSelector(
  (state) => state.contractInstance.factoryContract,

  (factoryContract) => factoryContract
);

const selectInitialized = createSelector(
  (state) => state.initialized,

  (initialized) => initialized
);

const selectCampaigns = createSelector(
  (state) => state.campaigns,

  (campaigns) => campaigns
);

const selectCurrentAccount = createSelector(
  (state) => state.currentAccount,

  (currentAccount) => currentAccount
);

export const ethActions = ethSlice.actions;
export const ethReducer = ethSlice.reducer;
export const ETH = ethSlice.name;
export const ethSelector = {
  factoryContract: (state) => selectFactoryContract(state[ETH]),
  web3: (state) => selectWeb3(state[ETH]),
  all: (state) => selectAll(state[ETH]),
  initialized: (state) => selectInitialized(state[ETH]),
  campaigns: (state) => selectCampaigns(state[ETH]),
  campaignContract: (state) => selectCampaignContract(state[ETH]),
  currentAccount: (state) => selectCurrentAccount(state[ETH]),
};
