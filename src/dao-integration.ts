/**
 * DAO Governance Integration with WalletConnect
 * Provides methods to interact with the DAO contract using WalletConnect
 */

import { WalletKit } from '@reown/walletkit';
import { StacksWalletService, STXToMicroSTX } from './stacks-wallet';
import { StacksNetwork } from './walletconnect-config';

/**
 * DAO Contract Configuration
 */
export interface DAOConfig {
  contractAddress: string;
  contractName: string;
  network: StacksNetwork;
}

/**
 * Proposal structure matching the Clarity contract
 */
export interface Proposal {
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  recipient: string;
  amount: bigint;
  startBlock: number;
  endBlock: number;
  yesVotes: number;
  noVotes: number;
  executed: boolean;
  cancelled: boolean;
}

/**
 * DAO Governance Service
 * Provides high-level methods to interact with the DAO contract
 */
export class DAOGovernanceService {
  private walletService: StacksWalletService;
  private config: DAOConfig;

  constructor(walletService: StacksWalletService, config: DAOConfig) {
    this.walletService = walletService;
    this.config = config;
  }

  /**
   * Get the full contract identifier
   */
  private getContractIdentifier(): string {
    return `${this.config.contractAddress}.${this.config.contractName}`;
  }

  /**
   * Check if user is a DAO member
   */
  async isDAOMember(address: string): Promise<boolean> {
    // In a real implementation, this would query the contract
    // For now, returning a placeholder
    // You would use Stacks.js to make a read-only contract call
    return true;
  }

  /**
   * Get member's voting power
   */
  async getMemberVotingPower(address: string): Promise<number> {
    // In a real implementation, query the contract for voting power
    return 1;
  }

  /**
   * Get treasury balance
   */
  async getTreasuryBalance(): Promise<bigint> {
    // In a real implementation, query the contract balance
    return BigInt(0);
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: number): Promise<Proposal | null> {
    // In a real implementation, query the contract for proposal details
    // This would be a read-only contract call
    return null;
  }

  /**
   * Get total proposal count
   */
  async getProposalCount(): Promise<number> {
    // In a real implementation, query the contract
    return 0;
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    title: string,
    description: string,
    recipient: string,
    amountSTX: number
  ): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Convert STX to micro-STX
    const amountMicroSTX = STXToMicroSTX(amountSTX);

    // Build function arguments for the contract call
    const functionArgs = [
      `"${title}"`, // title (string-ascii 256)
      `"${description}"`, // description (string-ascii 1024)
      `'${recipient}`, // recipient (principal)
      `u${amountMicroSTX}`, // amount (uint)
    ];

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'create-proposal',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Vote on a proposal
   */
  async vote(proposalId: number, support: boolean): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [
      `u${proposalId}`, // proposal-id (uint)
      support ? 'true' : 'false', // support (bool)
    ];

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'vote',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Execute a passed proposal
   */
  async executeProposal(proposalId: number): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [`u${proposalId}`]; // proposal-id (uint)

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'execute-proposal',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Cancel a proposal (only proposer or owner)
   */
  async cancelProposal(proposalId: number): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [`u${proposalId}`]; // proposal-id (uint)

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'cancel-proposal',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Deposit STX to treasury
   */
  async depositToTreasury(amountSTX: number): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Convert STX to micro-STX
    const amountMicroSTX = STXToMicroSTX(amountSTX);

    // Build function arguments
    const functionArgs = [`u${amountMicroSTX}`]; // amount (uint)

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'deposit-to-treasury',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Add a new DAO member (owner only)
   */
  async addMember(memberAddress: string): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [`'${memberAddress}`]; // new-member (principal)

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'add-member',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Remove a DAO member (owner only)
   */
  async removeMember(memberAddress: string): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [`'${memberAddress}`]; // member (principal)

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'remove-member',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Update member voting power (owner only)
   */
  async updateVotingPower(
    memberAddress: string,
    newPower: number
  ): Promise<{ txid: string; transaction: string }> {
    const connectedAddress = this.walletService.getConnectedAddress();
    if (!connectedAddress) {
      throw new Error('No wallet connected');
    }

    // Build function arguments
    const functionArgs = [
      `'${memberAddress}`, // member (principal)
      `u${newPower}`, // new-power (uint)
    ];

    // Call the contract
    const result = await this.walletService.callContract({
      contract: this.getContractIdentifier(),
      functionName: 'update-voting-power',
      functionArgs,
      sender: connectedAddress,
      network: this.config.network,
    });

    return result;
  }

  /**
   * Check if a proposal has passed
   */
  async hasProposalPassed(proposalId: number): Promise<boolean> {
    // In a real implementation, this would be a read-only contract call
    return false;
  }

  /**
   * Check if voting is still active for a proposal
   */
  async isVotingActive(proposalId: number): Promise<boolean> {
    // In a real implementation, this would be a read-only contract call
    return true;
  }
}

/**
 * Factory function to create a DAO Governance Service instance
 */
export function createDAOGovernanceService(
  walletKit: WalletKit,
  config: DAOConfig
): DAOGovernanceService {
  const walletService = new StacksWalletService(walletKit, config.network);
  return new DAOGovernanceService(walletService, config);
}
