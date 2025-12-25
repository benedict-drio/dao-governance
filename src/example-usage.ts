/**
 * WalletConnect Integration Example
 * Demonstrates how to use WalletConnect with the DAO Governance contract
 */

import {
  initializeWalletKit,
  createSessionProposalHandler,
  createSessionRequestHandler,
  createSessionDeleteHandler,
  StacksNetwork,
} from './walletconnect-config';
import { StacksWalletService } from './stacks-wallet';
import { createDAOGovernanceService, DAOConfig } from './dao-integration';

/**
 * Example: Initialize WalletConnect and DAO Service
 */
async function initializeApp() {
  try {
    console.log('Initializing WalletConnect...');

    // 1. Initialize WalletKit
    const walletKit = await initializeWalletKit(StacksNetwork.TESTNET);
    console.log('WalletKit initialized successfully');

    // 2. Create wallet service
    const walletService = new StacksWalletService(walletKit, StacksNetwork.TESTNET);

    // 3. Set up session proposal handler
    createSessionProposalHandler(
      walletKit,
      (session) => {
        console.log('Session approved:', session);
      },
      (error) => {
        console.error('Session rejected:', error);
      }
    );

    // 4. Set up session request handler
    const requestHandlers = walletService.createRequestHandlers();
    createSessionRequestHandler(walletKit, requestHandlers);

    // 5. Set up disconnect handler
    createSessionDeleteHandler(walletKit, (topic) => {
      console.log('Session disconnected:', topic);
    });

    // 6. Configure DAO
    const daoConfig: DAOConfig = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your contract address
      contractName: 'dao-governance',
      network: StacksNetwork.TESTNET,
    };

    // 7. Create DAO service
    const daoService = createDAOGovernanceService(walletKit, daoConfig);

    console.log('DAO Governance app initialized successfully!');

    return {
      walletKit,
      walletService,
      daoService,
    };
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
}

/**
 * Example: Connect to a wallet
 */
async function connectWallet(walletService: StacksWalletService, address: string) {
  console.log('Connecting wallet:', address);
  walletService.setConnectedAddress(address);
  console.log('Wallet connected successfully');
}

/**
 * Example: Create a proposal
 */
async function exampleCreateProposal(daoService: any) {
  try {
    console.log('Creating a new proposal...');

    const result = await daoService.createProposal(
      'Fund Community Event', // title
      'Allocate 100 STX to fund the upcoming community hackathon', // description
      'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // recipient
      100 // amount in STX
    );

    console.log('Proposal created successfully!');
    console.log('Transaction ID:', result.txid);

    return result;
  } catch (error) {
    console.error('Failed to create proposal:', error);
    throw error;
  }
}

/**
 * Example: Vote on a proposal
 */
async function exampleVoteOnProposal(daoService: any, proposalId: number, support: boolean) {
  try {
    console.log(`Voting ${support ? 'YES' : 'NO'} on proposal ${proposalId}...`);

    const result = await daoService.vote(proposalId, support);

    console.log('Vote cast successfully!');
    console.log('Transaction ID:', result.txid);

    return result;
  } catch (error) {
    console.error('Failed to vote:', error);
    throw error;
  }
}

/**
 * Example: Execute a proposal
 */
async function exampleExecuteProposal(daoService: any, proposalId: number) {
  try {
    console.log(`Executing proposal ${proposalId}...`);

    const result = await daoService.executeProposal(proposalId);

    console.log('Proposal executed successfully!');
    console.log('Transaction ID:', result.txid);

    return result;
  } catch (error) {
    console.error('Failed to execute proposal:', error);
    throw error;
  }
}

/**
 * Example: Deposit to treasury
 */
async function exampleDepositToTreasury(daoService: any, amount: number) {
  try {
    console.log(`Depositing ${amount} STX to treasury...`);

    const result = await daoService.depositToTreasury(amount);

    console.log('Deposit successful!');
    console.log('Transaction ID:', result.txid);

    return result;
  } catch (error) {
    console.error('Failed to deposit:', error);
    throw error;
  }
}

/**
 * Example: Get proposal details
 */
async function exampleGetProposal(daoService: any, proposalId: number) {
  try {
    console.log(`Fetching proposal ${proposalId}...`);

    const proposal = await daoService.getProposal(proposalId);

    if (proposal) {
      console.log('Proposal details:', proposal);
      console.log(`Title: ${proposal.title}`);
      console.log(`Description: ${proposal.description}`);
      console.log(`Amount: ${proposal.amount} microSTX`);
      console.log(`Yes votes: ${proposal.yesVotes}`);
      console.log(`No votes: ${proposal.noVotes}`);
      console.log(`Executed: ${proposal.executed}`);
    } else {
      console.log('Proposal not found');
    }

    return proposal;
  } catch (error) {
    console.error('Failed to fetch proposal:', error);
    throw error;
  }
}

/**
 * Example: Check if user is a DAO member
 */
async function exampleCheckMembership(daoService: any, address: string) {
  try {
    console.log(`Checking if ${address} is a DAO member...`);

    const isMember = await daoService.isDAOMember(address);

    console.log(`Is member: ${isMember}`);

    return isMember;
  } catch (error) {
    console.error('Failed to check membership:', error);
    throw error;
  }
}

/**
 * Main example function
 */
async function main() {
  try {
    // Initialize the app
    const { walletKit, walletService, daoService } = await initializeApp();

    // Example: Connect a wallet
    const myAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    await connectWallet(walletService, myAddress);

    // Example: Check membership
    await exampleCheckMembership(daoService, myAddress);

    // Example: Create a proposal
    const proposal = await exampleCreateProposal(daoService);

    // Example: Vote on the proposal
    await exampleVoteOnProposal(daoService, 1, true);

    // Example: Get proposal details
    await exampleGetProposal(daoService, 1);

    // Example: Deposit to treasury
    await exampleDepositToTreasury(daoService, 50);

    // Example: Execute the proposal (after voting period ends)
    // await exampleExecuteProposal(daoService, 1);

    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export all functions for use in other modules
export {
  initializeApp,
  connectWallet,
  exampleCreateProposal,
  exampleVoteOnProposal,
  exampleExecuteProposal,
  exampleDepositToTreasury,
  exampleGetProposal,
  exampleCheckMembership,
  main,
};

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
