import { ConnectWallet, Web3Button, useContractRead, useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import { useState, useEffect } from 'react'
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";


export default function Home() {


  const stakingContractAddress = "0x0ae744590Ad1b09a650E83Dec27a23A2F54C87F4"
  const stakingTokenAddress = "0xFd7C5a44b097d9643941C370D101F6E50d21015d"
  const rewardTokenAddress = "0x9c9f66BD8141C3605f8D6a6F34b4199213491be2"




  const address = useAddress()
  const [amountToStake, setAmountToStake] = useState(0)

  const { contract: staking, isLoading: isStakingLoading } = useContract(
    stakingContractAddress,
    "custom"
  );

  const { contract: stakingToken, isLoading: isStakingTokenLoading } =
    useContract(stakingTokenAddress, "token");

  const { contract: rewardToken, isLoading: isRewardTokenLoading } = useContract(
    rewardTokenAddress,
    "token"
  );

  const { data: stakingTokenBalance, refetch: refetchStakingTokenBalance } =
    useTokenBalance(stakingToken, address);
  const { data: rewardTokenBalance, refetch: refetchRewardTokenBalance } =
    useTokenBalance(rewardToken, address);

  const {
    data: stakeInfo,
    refetch: refetchStakingInfo,
    isLoading: isStakeInfoLoading,
  } = useContractRead(staking, "getStakeInfo", [address] || "0");

  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 10000);
  }, []);

  const refetchData = () => {
    refetchRewardTokenBalance();
    refetchStakingTokenBalance();
    refetchStakingInfo();
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Staking App </h1>

        <p className={styles.description}>
          Stake certain amount and get reward tokens back!
        </p>

        <div className={styles.connect}>
          <ConnectWallet />
        </div>

        <div className={styles.stakeContainer}>
          <input
            className={styles.textbox}
            type="number"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
          />

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await stakingToken.setAllowance(
                stakingContractAddress,
                amountToStake
              );
              await contract.call(
                "stake",
                [ethers.utils.parseEther(amountToStake)]
              );
              alert("Tokens staked successfully!");
            }}
          >
            Stake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call(
                "withdraw",
                [ethers.utils.parseEther(amountToStake)]
              );
              alert("Tokens unstaked successfully!");
            }}
          >
            Unstake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call("claimRewards");
              alert("Rewards claimed successfully!");
            }}
          >
            Claim rewards!
          </Web3Button>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Stake token balance</h2>
            <p>{stakingTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Reward token balance</h2>
            <p>{rewardTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Staked amount</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[0].toString())}
            </p>
          </a>

          <a className={styles.card}>
            <h2>Current reward</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[1].toString())}
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
