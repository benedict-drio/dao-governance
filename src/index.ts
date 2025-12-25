/**
 * Main entry point for WalletConnect DAO Governance Integration
 * Exports all public APIs for easy consumption
 */

// Configuration
export {
  WALLET_CONNECT_CONFIG,
  StacksNetwork,
  STACKS_CHAIN_IDS,
  STACKS_METHODS,
  STACKS_EVENTS,
  initializeWalletConnectCore,
  initializeWalletKit,
  createSessionProposalHandler,
  createSessionRequestHandler,
  createSessionDeleteHandler,
} from './walletconnect-config';

// Stacks Wallet Service
export {
  StacksWalletService,
  microSTXToSTX,
  STXToMicroSTX,
  isValidStacksAddress,
} from './stacks-wallet';

export type {
  StacksAddress,
  GetAddressesResponse,
  TransferSTXParams,
  SignTransactionParams,
  SignMessageParams,
  CallContractParams,
} from './stacks-wallet';

// DAO Integration
export {
  DAOGovernanceService,
  createDAOGovernanceService,
} from './dao-integration';

export type {
  DAOConfig,
  Proposal,
} from './dao-integration';

// Example Usage
export {
  initializeApp,
  connectWallet,
  exampleCreateProposal,
  exampleVoteOnProposal,
  exampleExecuteProposal,
  exampleDepositToTreasury,
  exampleGetProposal,
  exampleCheckMembership,
} from './example-usage';
