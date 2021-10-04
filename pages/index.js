import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { inflateRaw } from './lib/pako.esm'
import Carousel from 'react-multi-carousel'
import "react-multi-carousel/lib/styles.css"
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  ROLLUP_ADDRESS
} from '../config'

const TREASURY_ADDRESS = '0x7ce1af84F3d83305315aE460B6F18C011F0b268e';
const GITHUB_ISSUES_PAGE = "https://github.com/hominids/Improvements-FeatureFarm/issues";


const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 630, min: 0 },
    items: 1
  }
};

export const HABITAT_ROLLUP_ABI = [
    'event BlockBeacon()',
    'event ClaimUsername(address indexed account, bytes32 indexed shortString)',
    'event ClaimedStakingReward(address indexed account, address indexed token, uint256 indexed epoch, uint256 amount)',
    'event CommunityCreated(address indexed governanceToken, bytes32 indexed communityId)',
    'event CustomBlockBeacon()',
    'event DelegatedAmount(address indexed account, address indexed delegatee, address indexed token, uint256 value)',
    'event DelegateeVotedOnProposal(address indexed account, bytes32 indexed proposalId, uint8 signalStrength, uint256 shares)',
    'event Deposit(address owner, address token, uint256 value, uint256 tokenType)',
    'event MetadataUpdated(uint256 indexed topic, bytes metadata)',
    'event ModuleRegistered(address indexed contractAddress, bytes metadata)',
    'event NewSolution()',
    'event ProposalCreated(address indexed vault, bytes32 indexed proposalId, uint256 startDate)',
    'event ProposalProcessed(bytes32 indexed proposalId, uint256 indexed votingStatus)',
    'event RollupUpgrade(address target)',
    'event TokenTransfer(address indexed token, address indexed from, address indexed to, uint256 value, uint256 epoch)',
    'event VaultCreated(bytes32 indexed communityId, address indexed condition, address indexed vaultAddress)',
    'event VirtualERC20Created(address indexed account, address indexed token)',
    'event VotedOnProposal(address indexed account, bytes32 indexed proposalId, uint8 signalStrength, uint256 shares)',
    'event Withdraw(address owner, address token, uint256 value)',
    'function EPOCH_GENESIS() pure returns (uint256)',
    'function INSPECTION_PERIOD() view returns (uint16)',
    'function INSPECTION_PERIOD_MULTIPLIER() view returns (uint256)',
    'function MAX_BLOCK_SIZE() view returns (uint24)',
    'function ROLLUP_MANAGER() pure returns (address)',
    'function SECONDS_PER_EPOCH() pure returns (uint256)',
    'function STAKING_POOL_FEE_DIVISOR() pure returns (uint256)',
    'function blockMeta(uint256 height) view returns (uint256 ret)',
    'function canFinalizeBlock(uint256 blockNumber) view returns (bool)',
    'function challenge()',
    'function communityOfVault(address vault) returns (bytes32)',
    'function deposit(address token, uint256 amountOrId, address receiver)',
    'function dispute(uint256 blockNumber, uint256 bitmask)',
    'function executionPermit(address vault, bytes32 proposalId) view returns (bytes32 ret)',
    'function finalizeSolution()',
    'function finalizedHeight() view returns (uint256 ret)',
    'function getActiveDelegatedVotingStake(address token, address account) returns (uint256)',
    'function getActiveVotingStake(address token, address account) returns (uint256)',
    'function getBalance(address tkn, address account) returns (uint256)',
    'function getCurrentEpoch() returns (uint256)',
    'function getERC20Exit(address target, address owner) view returns (uint256)',
    'function getERC721Exit(address target, uint256 tokenId) view returns (address)',
    'function getErc721Owner(address tkn, uint256 b) returns (address)',
    'function getHistoricTub(address token, address account, uint256 epoch) returns (uint256)',
    'function getHistoricTvl(address token, uint256 epoch) returns (uint256)',
    'function getLastClaimedEpoch(address token, address account) returns (uint256)',
    'function getProposalStatus(bytes32 a) returns (uint256)',
    'function getTotalMemberCount(bytes32 communityId) returns (uint256)',
    'function getTotalValueLocked(address token) returns (uint256)',
    'function getTotalVotingShares(bytes32 proposalId) returns (uint256)',
    'function getUnlockedBalance(address token, address account) returns (uint256 ret)',
    'function pendingHeight() view returns (uint256 ret)',
    'function registerModule(uint256 _type, address contractAddress, bytes32 codeHash, bytes)',
    'function submitBlock()',
    'function submitSolution()',
    'function tokenOfCommunity(bytes32 a) returns (address)',
    'function txNonces(address a) returns (uint256)',
    'function upgradeRollup(address newImplementation)',
    'function withdraw(address owner, address token, uint256 tokenId)'
];

const TYPED_DATA = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
    ],
    // Transactions that can be replayed need nonces.
    // Other transaction types revert if replayed.
    TransferToken: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    ClaimUsername: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'shortString', type: 'bytes32' },
    ],
    CreateCommunity: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'governanceToken', type: 'address' },
      { name: 'metadata', type: 'bytes' },
    ],
    CreateVault: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'communityId', type: 'bytes32' },
      { name: 'condition', type: 'address' },
      { name: 'metadata', type: 'bytes' },
    ],
    CreateProposal: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'startDate', 'type': 'uint256' },
      { name: 'vault', type: 'address' },
      { name: 'internalActions', type: 'bytes' },
      { name: 'externalActions', type: 'bytes' },
      { name: 'metadata', type: 'bytes' },
    ],
    VoteOnProposal: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'shares', type: 'uint256' },
      { name: 'delegatedFor', type: 'address' },
      { name: 'signalStrength', type: 'uint8' },
    ],
    ProcessProposal: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'proposalId', type: 'bytes32' },
      { name: 'internalActions', type: 'bytes' },
      { name: 'externalActions', type: 'bytes' },
    ],
    TributeForOperator: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'operator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    DelegateAmount: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'delegatee', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    ClaimStakingReward: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'token', 'type': 'address' },
      { name: 'sinceEpoch', 'type': 'uint256' },
    ],
    ModifyRollupStorage: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'data', 'type': 'bytes' },
    ],
    CreateVirtualERC20: [
      { name: 'nonce', 'type': 'uint256' },
      { name: 'factoryAddress', 'type': 'address' },
      { name: 'args', 'type': 'bytes' },
    ],
  },
  domain: {
    name: 'Habitat V1',
  },
  primaryTypes: [
    'TransferToken',
    'ClaimUsername',
    'CreateCommunity',
    'CreateVault',
    'CreateProposal',
    'VoteOnProposal',
    'ProcessProposal',
    'TributeForOperator',
    'DelegateAmount',
    'ClaimStakingReward',
    'ModifyRollupStorage',
    'CreateVirtualERC20',
  ],
};


const ROLLUP_RPC = 'https://mainnet-habitat-l2.fly.dev/';
const EVOLUTION_ENDPOINT = 'https://habitat-evolution.fly.dev/submitTransaction/';

export default function Home() {
  const [proposals, setProposals] = useState([])
  // const [maxVotes, setMaxVotes] = useState()
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadProposals()
    // dummyData()
  }, [])

  async function decodeMetadata (str) {
    try {
      return JSON.parse(inflateRaw(ethers.utils.arrayify(str), { to: 'string' }));
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  async function loadProposals() {    
    const rollupProvider = new ethers.providers.JsonRpcProvider(ROLLUP_RPC, 'any');
    const rollup = new ethers.Contract(ROLLUP_ADDRESS, HABITAT_ROLLUP_ABI, rollupProvider);
    const filter = rollup.filters.ProposalCreated([TREASURY_ADDRESS], null, null);
    filter.fromBlock = 1;
    const data = await rollup.provider.getLogs(filter);
    //iterate over data
    const items = await Promise.all(data.map(async i => {
      //get proposalId from 3rd item in "topics"
      const proposalId = i.topics[2];
      //get 'txHash' from each proposal
      const txHash = i.transactionHash;
      //get 'title' and 'details' from 'txHash (Habitat proposal url)'
      const tx = await rollup.provider.send('eth_getTransactionByHash', [txHash]);
      const metadata = await decodeMetadata(tx.message.metadata);
      //get proposal's votes from proposalId
      const votes = (Number(await rollup.callStatic.getTotalVotingShares(proposalId))) * 0.0000000001;
      //universal link to the issues repo
      const github = GITHUB_ISSUES_PAGE;

      let item = {
        proposalId,
        votes,
        txHash,
        block: i.blockNumber,
        title: metadata.title,
        body: metadata.details,
        github
      }
      return item
    }))
    setProposals(items)
    setLoadingState('loaded')
  }

  async function sendTransaction (proposalId) {
    const primaryType = 'VoteOnProposal';
    const rollupProvider = new ethers.providers.JsonRpcProvider(ROLLUP_RPC, 'any');
    const rollup = new ethers.Contract(ROLLUP_ADDRESS, HABITAT_ROLLUP_ABI, rollupProvider);
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress();
    const message = {nonce: ((await rollup.callStatic.txNonces(signerAddress)).toHexString()), proposalId: proposalId, shares: ethers.utils.parseUnits('1.0', 10).toHexString(), delegatedFor: ethers.constants.AddressZero, signalStrength: 100};
    const tx = Object.assign({ message, primaryType }, TYPED_DATA);
    const sig = await signer.provider.send('eth_signTypedData_v4', [signerAddress, JSON.stringify(tx)]);
    const { r, s, v } = ethers.utils.splitSignature(sig);
    const operatorMessage = await ethers.utils.fetchJson(EVOLUTION_ENDPOINT, JSON.stringify({ primaryType, message, r, s, v }));
    if (operatorMessage.error) {
      throw new Error(operatorMessage.error.message);
    }
    const txHash = operatorMessage.result;
    const receipt = await rollup.provider.getTransactionReceipt(txHash);
    console.log({ receipt });
    if (receipt.status === 0) {
      throw new Error('transaction reverted');
    }
    // convenience
    receipt.events = [];
    for (const obj of receipt.logs) {
      try {
        receipt.events.push(Object.assign({ transactionHash: obj.transactionHash }, rollup.interface.parseLog(obj)));
      } catch (e) {
        console.warn(e);
      }
    }
    loadProposals();
    return receipt;
  }

/*
  async function dummyData() {  
      let items = [{
        proposalId: "asdlfkj",
        votes: 4,
        txHash: "asldfjasldf",
        block: 233,
        title: "this is a title",
        body: "this is the body of the paragraph or proposals"
      },
      {
        proposalId: "asdlfkj",
        votes: 400000,
        txHash: "asldfjasldf",
        block: 233,
        title: "this is a title",
        body: "this is the body of the paragraph or proposals asdlfkj asdkfjasklfd laksjdflksajf lkajsdflkajsd lkajsdlkfajsd lkajsdflkasj asldkfjaslkdfj laksdjflkasfdj alsdkfjaslkdfj alksdjfklasjdf alksdjflksadfj alskdjflkasdjf alksdjfklasjdf laksdjflksajdf laksjdfklsajdf laksdjflksdjf proposals asdlfkj asdkfjasklfd laksjdflksajf lkajsdflkajsd lkajsdlkfajsd lkajsdflkasj asldkfjaslkdfj laksdjflkasfdj alsdkfjaslkdfj alksdjfklasjdf alksdjflksadfj alskdjflkasdjf alksdjfklasjdf laksdjflksajdf laksjdfklsajdf laksdjflksdjf proposals asdlfkj asdkfjasklfd laksjdflksajf lkajsdflkajsd lkajsdlkfajsd lkajsdflkasj asldkfjaslkdfj laksdjflkasfdj alsdkfjaslkdfj alksdjfklasjdf alksdjflksadfj alskdjflkasdjf alksdjfklasjdf laksdjflksajdf laksjdfklsajdf laksdjflksdjf proposals asdlfkj asdkfjasklfd laksjdflksajf lkajsdflkajsd lkajsdlkfajsd lkajsdflkasj asldkfjaslkdfj laksdjflkasfdj alsdkfjaslkdfj alksdjfklasjdf alksdjflksadfj alskdjflkasdjf alksdjfklasjdf laksdjflksajdf laksjdfklsajdf laksdjflksdjf"
      }]

    setProposals(items)
    setLoadingState('loaded')
  }
*/

  if (loadingState === 'loaded' && !proposals.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
      <h1 className="px-8 pt-5 text-3xl font-bold">Proposals</h1>
      <Carousel
        responsive={responsive}
        centerMode={false}
        showDots={true}
        slidesToSlide={1}
        infinite={true}
        draggable={true}
        itemClass="flex justify-center p-4"
        containerClass="flex w-screen"
        sliderClass=""
        showDots={false}
      >
          {
            proposals.map((proposal, i) => (
              <div key={i} className="relative border shadow rounded-3xl overflow-hidden bg-white w-full h-96">
                <div className="flex flex-col p-4">
                  <div className="border-b flex justify-between">
                    <p style={{ height: '64px' }} className="text-2xl font-semibold overflow-hidden">{proposal.title}</p>
                    <a href={`https://0xhabitat.org/app/#habitat-proposal,${proposal.txHash}`} className="p-2">
                      <FaExternalLinkAlt className="text-gray-300"/>
                    </a>
                  </div>
                  <div className="h-60 overflow-auto py-2" dangerouslySetInnerHTML={{__html: proposal.body}}>
                  </div>
                </div>

                <div className="absolute bottom-0 w-full bg-black p-2">
                  <div className="flex justify-between ">
                    <div className="flex items-center">

                      <div className="fixed flex-shrink truncate p-3">
                        <p className="truncate ... text-2xl font-semibold text-white">{proposal.votes} HBT</p>
                      </div>
                    </div>
                    <div className="sticky flex-shrink-0">
                      <div className="flex flex-row-reverse items-stretch">
                      <div className="bg-black">
                        <button className="bg-blue-600 border-2 border-blue-600 text-white rounded-full w-24 h-12 py-2 px-2 m-1 hover:shadow-2xl hover:ring-1 hover:ring-blue-600 transition duration-300 font-bold" onClick={() => sendTransaction(proposal.proposalId)}>
                            Vote
                        </button>
                        <button className="text-sm text-blue-600 border-2 border-blue-600 rounded-full bg-transparent w-24 h-12 py-2 px-2 m-1 hover:bg-blue-600 hover:text-white transition duration-100 font-semibold">
                          <a href={`${proposal.github}`}>
                            Discuss
                          </a>
                        </button>
                      </div>
                      <div className="bg-gradient-to-r from-transparent to-black w-10">
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </Carousel>
      </div>
    </div>
  )
}