import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { NftTicket } from "../typechain";

describe("Interaction with nftTicket", () => {
  let accounts: SignerWithAddress[];
  let nftTicketContract: NftTicket;
  let eventOwner: SignerWithAddress;
  let EventNameSet: string; 
  let EventSymbolSet: string;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    eventOwner = accounts[0];
    // NOTE: To adjust these two variables as necessary
    EventNameSet = "Encode Club Dinner";
    EventSymbolSet = "ECD";
    const nftTicketContractFactory = await ethers.getContractFactory(
      "NftTicket"
    );
    nftTicketContract = await nftTicketContractFactory.deploy(
      EventNameSet,
      EventSymbolSet
    );
    await nftTicketContract.deployed();
  })

  describe("Deployment of contract by event organiser ", async () => {
    it("Should show the correct name and symbol", async () => {
      const eventNameExpected = await nftTicketContract.name();
      expect(eventNameExpected).to.eq(EventNameSet);
      const eventSymbolExpected = await nftTicketContract.symbol();
      expect(eventSymbolExpected).to.eq(EventSymbolSet);
    });
  })

  describe("Setting ticket categories", async () => {
    it("Should set the right ticket price and max no", async () => {
      // NOTE: Set ticket category price and max no accordingly
      const ticketCategoryNameVIP = "VIP";
      const ticketPriceSetVIP = 0.09;
      const maxNoOfTicketsSetVIP = 250;
      const numberOfTicketsBoughtSet = 0;

      const ticketCategoryNameBytes32 = ethers.utils.formatBytes32String(
        ticketCategoryNameVIP
      );
      console.log(`VIP Bytes32: ${ticketCategoryNameBytes32}`);
      const ticketPriceSetVIPBN = ethers.utils.parseEther(
        ticketPriceSetVIP.toString()
      );
      const tx = await nftTicketContract
        .connect(eventOwner)
        .setUpTicket(
          ticketCategoryNameBytes32,
          ticketPriceSetVIPBN,
          maxNoOfTicketsSetVIP,
          numberOfTicketsBoughtSet
        );
      await tx.wait();
      
      const ticketCategoryVIPExpected = await nftTicketContract
        .ticketCategoryMapping(ticketCategoryNameBytes32);
      const ticketPriceVIPExpectedBN = await ticketCategoryVIPExpected.ticketPrice;
      const ticketPriceVIPExpectedString = await ethers.utils.formatEther(
        ticketPriceVIPExpectedBN
      );
      expect(ticketPriceVIPExpectedString).to.eq(ticketPriceSetVIP.toString());
      
    });

    it("Should show the correct number of ticket categories in the array", async () => {
      // NOTE: Set ticket category price and max no accordingly
      const ticketCategoryNameVIP = "VIP";
      const ticketPriceSetVIP = 0.09;
      const maxNoOfTicketsSetVIP = 250;
      const numberOfTicketsBoughtVIPSet = 0;

      const ticketCategoryNameVIPBytes32 = ethers.utils.formatBytes32String(
        ticketCategoryNameVIP
      );
      const ticketPriceSetVIPBN = ethers.utils.parseEther(
        ticketPriceSetVIP.toString()
      );
      const tx1 = await nftTicketContract
        .connect(eventOwner)
        .setUpTicket(
          ticketCategoryNameVIPBytes32,
          ticketPriceSetVIPBN,
          maxNoOfTicketsSetVIP,
          numberOfTicketsBoughtVIPSet
        );
      await tx1.wait();

      // NOTE: Set ticket category price and max no accordingly
      const ticketCategoryNameVVIP = "VVIP";
      const ticketPriceSetVVIP = 0.09;
      const maxNoOfTicketsSetVVIP = 250;
      const numberOfTicketsBoughtVVIPSet = 0;

      const ticketCategoryNameVVIPBytes32 = ethers.utils.formatBytes32String(
        ticketCategoryNameVVIP
      );
      const ticketPriceSetVVIPBN = ethers.utils.parseEther(
        ticketPriceSetVVIP.toString()
      );
      const tx2 = await nftTicketContract
        .connect(eventOwner)
        .setUpTicket(
          ticketCategoryNameVVIPBytes32,
          ticketPriceSetVVIPBN,
          maxNoOfTicketsSetVVIP,
          numberOfTicketsBoughtVVIPSet
        );
      await tx2.wait();

      const arrayLengthExpected = await nftTicketContract.getTicketCategoryArraySize();
      console.log(`Array Length: ${arrayLengthExpected}`);
      expect(arrayLengthExpected).to.eq("2");
    });
  });
  describe("Buying tickets", async () => {
    // NOTE: Set ticket category price and max no accordingly
    const ticketCategoryNameVIP = "VIP";
    const ticketPriceSetVIP = 0.09;
    const maxNoOfTicketsSetVIP = 250;
    const numberOfTicketsBoughtSet = 0;

    const ticketCategoryNameBytes32 = ethers.utils.formatBytes32String(
      ticketCategoryNameVIP
    );
    const ticketPriceSetVIPBN = ethers.utils.parseEther(
      ticketPriceSetVIP.toString()
    );
    beforeEach(async () => {
      const tx = await nftTicketContract
        .connect(eventOwner)
        .setUpTicket(
          ticketCategoryNameBytes32,
          ticketPriceSetVIPBN,
          maxNoOfTicketsSetVIP,
          numberOfTicketsBoughtSet
        );
      await tx.wait();
    });
    it("Should not allow free minting", async () => {
      const buyer = accounts[1];
      // const ticketCategoryBytes32
      await expect(
        nftTicketContract
          .connect(buyer)
          .buyTicket(ticketCategoryNameBytes32)
      ).to.be.revertedWith("Please pay for ticket");
    });
    it("Should allow minting only with correct price", async () => {
      const buyer = accounts[1];
      // const ticketCategoryBytes32
      const tx1 = await
        nftTicketContract.connect(buyer).buyTicket(
          ticketCategoryNameBytes32,
          { value: ethers.utils.parseEther(ticketPriceSetVIP.toString()) }
        );
      await tx1.wait();
      const numberOfTicketOwnedByBuyerExpected = await nftTicketContract.balanceOf(buyer.address);
      expect(numberOfTicketOwnedByBuyerExpected).to.eq(1);
    });
    it("Should update the number of tickets bought correctly", async () => {
      const buyer = accounts[1];
      // const ticketCategoryBytes32
      const tx1 = await nftTicketContract
        .connect(buyer)
        .buyTicket(ticketCategoryNameBytes32, {
          value: ethers.utils.parseEther(ticketPriceSetVIP.toString()),
        });
      await tx1.wait();
      const numberOfTicketOwnedByBuyerExpected =
        await nftTicketContract.balanceOf(buyer.address);
      expect(numberOfTicketOwnedByBuyerExpected).to.eq(1);
      let ticketCategoryExpected =
        await nftTicketContract.ticketCategoryMapping(
          ticketCategoryNameBytes32
        );
      let numberOfTicketsBoughtExpected =
        await ticketCategoryExpected.numberOfTicketsBought;
      expect(numberOfTicketsBoughtExpected).to.eq(1);
      const buyer2 = accounts[2];
      const tx2 = await nftTicketContract
        .connect(buyer2)
        .buyTicket(ticketCategoryNameBytes32, {
          value: ethers.utils.parseEther(ticketPriceSetVIP.toString()),
        });
      await tx2.wait();
      ticketCategoryExpected = await nftTicketContract.ticketCategoryMapping(
        ticketCategoryNameBytes32
      );
      numberOfTicketsBoughtExpected =
        await ticketCategoryExpected.numberOfTicketsBought;
      expect(numberOfTicketsBoughtExpected).to.eq(2);
      console.log(`Number of tickets bought: ${numberOfTicketsBoughtExpected}`);
    })
    it("Should not allow transfer of tickets bought", async () => {
      const buyer = accounts[1];
      // const ticketCategoryBytes32
      const tx = await nftTicketContract
        .connect(buyer)
        .buyTicket(ticketCategoryNameBytes32, {
          value: ethers.utils.parseEther(ticketPriceSetVIP.toString()),
        });
      await tx.wait();
      const transferee = accounts[2];
      await expect(
        nftTicketContract
          .connect(buyer)
          .transferFrom(buyer.address, transferee.address, 1)
      ).to.be.revertedWith("Resell not allowed");
    });
  });
  describe("Setting event details", async () => {
    
    it("Should set the name correctly", async () => {
      // NOTE: Set the event details accordingly
      const eventNameSetString = "Encode Club Dinner";
      const eventDateSetString = "30 June 2022";
      const eventTimeSetString = "7pm";

      const eventNameSetBytes32 =
        ethers.utils.formatBytes32String(eventNameSetString);
      const eventDateSetBytes32 =
        ethers.utils.formatBytes32String(eventDateSetString);
      const eventTimeSetBytes32 =
        ethers.utils.formatBytes32String(eventTimeSetString);
      const tx = await nftTicketContract
        .connect(eventOwner)
        .setEventDetails(
          eventNameSetBytes32,
          eventDateSetBytes32,
          eventTimeSetBytes32
        );
      await tx.wait();
      const eventDetailsExpected = await nftTicketContract.eventDetails();
      const eventNameExpectedBytes32 = eventDetailsExpected.eventName;
      const eventNameExpectedString = await ethers.utils.parseBytes32String(
        eventNameExpectedBytes32
      );
      expect(eventNameExpectedString).to.eq(eventNameSetString);
    });
  });
});
