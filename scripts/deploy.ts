import { ethers } from "ethers";
import "dotenv/config";
import * as nftTicketJson from "../artifacts/contracts/NftTicketTest.sol/NftTicket.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  const wallet =
    process.env.PRIVATE_KEY_1 && process.env.PRIVATE_KEY_1.length > 0
      ? new ethers.Wallet(process.env.PRIVATE_KEY_1)
      : new ethers.Wallet(EXPOSED_KEY);

  console.log(`Using address ${wallet.address}`);

  const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
  const signer = wallet.connect(provider);

  console.log("Deploying NftTicket contract");

  const nftTicketContractFactory = await new ethers.ContractFactory(
    nftTicketJson.abi,
    nftTicketJson.bytecode,
    signer
  );

  // NOTE: To adjust these two variables as necessary
  const EventNameSet = "Encode Club Dinner";
  const EventSymbolSet = "ECD";

  const nftTicketContract = await nftTicketContractFactory.deploy(
    EventNameSet,
    EventSymbolSet
  );
  console.log("Awaiting confirmation on deployment of myTokenContract");
  const tx = await nftTicketContract.deployed();
  const deployTxReceipt = await tx.deployTransaction.wait();
  console.log("Completed");
  console.log("Contract deployed at: ", nftTicketContract.address);
  console.log(`Gas used: ${deployTxReceipt.gasUsed}`);
  console.log("Transaction hash:", deployTxReceipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
