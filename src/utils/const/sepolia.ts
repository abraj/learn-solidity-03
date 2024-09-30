// Anvil
// export const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

// Sepolia
export const contractAddress = '0xa99cEF196B643FA6e133590a0058091e87d185d7';

export const abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'priceFeedAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'fallback', stateMutability: 'payable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'fund',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getAddressAmount',
    inputs: [
      {
        name: 'fundedAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFunder',
    inputs: [{ name: 'index', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOwner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVersion',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'error', name: 'FundMe__NotOwner', inputs: [] },
];
