/**
 * WalletConnect Configuration
 * Configuration and initialization for WalletConnect integration with Stacks blockchain
 */

import { Core } from '@walletconnect/core';
import type { IWalletKit } from '@reown/walletkit';
import { WalletKit } from '@reown/walletkit';
import type { WalletKitTypes } from '@reown/walletkit';

// WalletConnect Project Configuration
export const WALLET_CONNECT_CONFIG = {
  projectId: process.env.WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE', // Get from https://cloud.walletconnect.com
  metadata: {
    name: 'DAO Governance',
    description: 'A complete DAO implementation with treasury management, proposals, and voting',
    url: 'https://your-dao-app.com', // Your app URL
    icons: ['https://your-dao-app.com/icon.png'], // Your app icon
  },
};

// Stacks Network Configuration
export enum StacksNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
}

export const STACKS_CHAIN_IDS = {
  [StacksNetwork.MAINNET]: 'stacks:mainnet',
  [StacksNetwork.TESTNET]: 'stacks:testnet',
  [StacksNetwork.DEVNET]: 'stacks:devnet',
} as const;

// Supported Stacks Methods
export const STACKS_METHODS = {
  GET_ADDRESSES: 'stx_getAddresses',
  TRANSFER_STX: 'stx_transferStx',
  SIGN_TRANSACTION: 'stx_signTransaction',
  SIGN_MESSAGE: 'stx_signMessage',
  SIGN_STRUCTURED_MESSAGE: 'stx_signStructuredMessage',
  CALL_CONTRACT: 'stx_callContract',
} as const;

// Supported Events
export const STACKS_EVENTS = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
} as const;

/**
 * Initialize WalletConnect Core
 */
export function initializeWalletConnectCore() {
  const core = new Core({
    projectId: WALLET_CONNECT_CONFIG.projectId,
  });
  return core;
}

/**
 * Initialize WalletKit with Stacks support
 */
export async function initializeWalletKit(network: StacksNetwork = StacksNetwork.MAINNET): Promise<IWalletKit> {
  const core = initializeWalletConnectCore();
  
  const walletKit = await WalletKit.init({
    core,
    metadata: WALLET_CONNECT_CONFIG.metadata,
  });

  // Note: Chain registration depends on the wallet implementation
  // Store the network configuration for later use
  console.log('WalletKit initialized for network:', network, STACKS_CHAIN_IDS[network]);

  return walletKit;
}

/**
 * Get session proposal handler
 */
export function createSessionProposalHandler(
  walletKit: IWalletKit,
  onApprove?: (session: any) => void,
  onReject?: (error: Error) => void
) {
  walletKit.on('session_proposal', async (proposal: WalletKitTypes.SessionProposal) => {
    try {
      console.log('Session proposal received:', proposal);
      
      // You can add custom approval logic here
      // For now, we'll auto-approve for the configured network
      
      const { id, params } = proposal;
      const { requiredNamespaces } = params;

      // Build approval namespaces
      const approvedNamespaces: Record<string, any> = {};
      
      for (const [key, namespace] of Object.entries(requiredNamespaces)) {
        if (key.startsWith('stacks')) {
          approvedNamespaces[key] = {
            accounts: namespace.chains?.map((chain: string) => `${chain}:YOUR_STACKS_ADDRESS`) || [],
            methods: namespace.methods || Object.values(STACKS_METHODS),
            events: namespace.events || Object.values(STACKS_EVENTS),
          };
        }
      }

      const session = await walletKit.approveSession({
        id,
        namespaces: approvedNamespaces,
      });

      if (onApprove) {
        onApprove(session);
      }

      return session;
    } catch (error) {
      console.error('Error approving session:', error);
      if (onReject && error instanceof Error) {
        onReject(error);
      }
      throw error;
    }
  });
}

/**
 * Get session request handler
 */
export function createSessionRequestHandler(
  walletKit: IWalletKit,
  requestHandlers: {
    [key: string]: (params: any) => Promise<any>;
  }
) {
  walletKit.on('session_request', async (event: WalletKitTypes.SessionRequest) => {
    try {
      const { topic, params, id } = event;
      const { request } = params;
      const { method, params: methodParams } = request;

      console.log('Session request received:', { method, params: methodParams });

      // Route to appropriate handler
      if (requestHandlers[method]) {
        const result = await requestHandlers[method](methodParams);
        
        await walletKit.respondSessionRequest({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            result,
          },
        });
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error) {
      console.error('Error handling session request:', error);
      
      await walletKit.respondSessionRequest({
        topic: event.topic,
        response: {
          id: event.id,
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    }
  });
}

/**
 * Disconnect session handler
 */
export function createSessionDeleteHandler(
  walletKit: IWalletKit,
  onDisconnect?: (topic: string) => void
) {
  walletKit.on('session_delete', (event: any) => {
    console.log('Session deleted:', event);
    if (onDisconnect) {
      onDisconnect(event.topic);
    }
  });
}
