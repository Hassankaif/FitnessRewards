import { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../utils/FitnessRewardsABI.json';

export const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userTokens, setUserTokens] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const contractAddress = '0x554b668E907D7A929f9E063A07bF4C5ab427C511'; // ← Replace with your deployed contract address

  // Utility to refresh token balance
  const refreshUserTokens = async () => {
    if (contract && account) {
      try {
        const tokens = await contract.getUserTokens(account);
        setUserTokens(tokens.toString());
      } catch (error) {
        console.error("Error refreshing tokens:", error);
        setUserTokens(0);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const selectedAccount = accounts[0];
          setAccount(selectedAccount);

          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);

          const signer = await ethersProvider.getSigner();

          const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(contractInstance);

          try {
            const contractOwner = await contractInstance.owner();
            setIsOwner(selectedAccount.toLowerCase() === contractOwner.toLowerCase());
          } catch (error) {
            console.log("Could not verify owner status:", error);
            setIsOwner(false);
          }

          // Get tokens for selected account
          const tokens = await contractInstance.getUserTokens(selectedAccount);
          setUserTokens(tokens.toString());

          setLoading(false);
        } catch (error) {
          console.error('Error initializing app:', error);
          setLoading(false);
        }
      } else {
        console.log('Please install MetaMask!');
        setLoading(false);
      }
    };

    init();

    // Detect account change and refresh token balance
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await refreshUserTokens();
          window.location.reload(); // optional: ensures clean UI refresh
        } else {
          setAccount('');
          setUserTokens(0);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <ContractContext.Provider
      value={{
        account,
        contract,
        provider,
        userTokens,
        isOwner,
        loading,
        refreshUserTokens,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
