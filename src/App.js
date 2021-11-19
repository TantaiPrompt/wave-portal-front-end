import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { async } from "q";
import abi from "./utils/WavePortal.json";
import "./App.css";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x23Ab0AC3C65aBcc9b8dC8648176Ae07E1A7C3e71";
  const [count, setCount] = useState(null);
  const [allWaves, setAllWaves] = useState([]);
  const [details, setDetails] = useState("");
  const contractABI = abi.abi;
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
      // getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let x = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", x.toNumber());
        const waveTxn = await waveportalContract.wave(details, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        x = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", x.toNumber());
        // setCount(x.toNumber());
        // getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
    setDetails("");
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        console.log(waves);
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves((prevState) => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">🐼 Hey there!</div>

          <div className="bio">
            My name is BOB and I'm a panda bear at some ZOO.
            <br />
            Connect your Ethereum wallet if you want to talk to me.
          </div>
          <form onSubmit={wave}>
            <textarea
              placeholder="type somethig !!"
              value={details}
              type="text"
              onChange={(e) => setDetails(e.target.value)}
            />
            <button className="waveButton" type="submit" value="Submit">
              leave a message
            </button>
          </form>

          {/*<button className="waveButton" type="submit" value="Submit">
          //    Give me a BamBoo
          //  </button>*/}

          {/*count!==null ? <div className ="header"> Total Bamboo:{count}</div>: null

          */}

          {/*
           * If there is no currentAccount render this button
           */}
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <div>
        {allWaves.map((wave, index) => {
          return (
            <div className="container">
              <div className="item">Address: {wave.address}</div>
              <div className="item">Time: {wave.timestamp.toString()}</div>
              <div className="item">Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
