import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { inflateRaw } from './lib/pako.esm'
import Carousel from 'react-multi-carousel'
import "react-multi-carousel/lib/styles.css"
//import Web3Modal from "web3modal"
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



const ROLLUP_RPC = 'https://mainnet-habitat-l2.fly.dev/';

export default function Home() {
  const [proposals, setProposals] = useState([])
  // const [maxVotes, setMaxVotes] = useState()
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    //loadProposals()
    loadProposals()
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
        itemClass="flex justify-center p-6"
        containerClass="flex w-screen"
        sliderClass=""
        showDots={false}
      >
          {
            proposals.map((proposal, i) => (
              <div key={i} className="relative border shadow rounded-3xl overflow-hidden bg-white h-96">
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold border-b overflow-hidden">{proposal.title}</p>
                  <div className="h-60 overflow-auto" dangerouslySetInnerHTML={{__html: proposal.body}}>
                  </div>
                </div>

                <div className="absolute bottom-0 w-full flex p-4 bg-black justify-evenly space-x-4">
                  <div className="flex flex-wrap content-end">
                    <p className="text-2xl mb-2 ml-1 font-semibold text-white">{proposal.votes} HBT</p>
                  </div>
                  <div className="flex-wrap max-h-28 text-right">
                    <button className="bg-blue-600 border-2 border-blue-600 text-white rounded-full w-24 h-12 py-2 px-2 m-1 hover:shadow-2xl hover:ring-1 hover:ring-blue-600 transition duration-300 font-bold">
                      <a href={`https://0xhabitat.org/app/#habitat-proposal,${proposal.txHash}`}>
                        Vote
                      </a>
                    </button>
                    <button className="text-sm text-blue-600 border-2 border-blue-600 rounded-full bg-transparent w-24 h-12 py-2 px-2 m-1 hover:bg-blue-600 hover:text-white transition duration-100 font-semibold">
                      <a href={`${proposal.github}`}>
                        Discuss
                      </a>
                    </button>
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