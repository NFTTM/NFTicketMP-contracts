//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftTicket is ERC721, Ownable, ReentrancyGuard {
    bool public canTransfer;
    uint256 public tokenId;
    string public baseURISet;
    struct TicketCategory {
        bytes32 categoryName;
        uint256 ticketPrice;
        uint256 maxNoOfTickets;
        uint256 numberOfTicketsBought;
    }
    struct EventDetails {
        bytes32 eventName;
        bytes32 eventDate;
        bytes32 eventTime;
    }
    event BuyTicket (address indexed _buyer, bytes32 _ticketCategory);
    event CheckIn (address indexed _attendee, bool checkedIn);
    EventDetails public eventDetails;
    mapping(address => bool) public checkedIn;
    mapping(address => bool) public hasBoughtTicket;
    /**
    @notice maps the ticket category name to the TicketCategory stuct so that
    price and max no for each ticket category can be queried
    */
    mapping(bytes32 => TicketCategory) public ticketCategoryMapping;
    
    // TODO: Consider removing
    TicketCategory[] public ticketCategoryArray;

    constructor(
        string memory _ticketName,
        string memory _ticketSymbol
    ) ERC721(_ticketName, _ticketSymbol){}

    function setEventDetails (
        bytes32 _eventName,
        bytes32 _eventDate,
        bytes32 _eventTime
    ) public onlyOwner {
        eventDetails.eventName = _eventName;
        eventDetails.eventDate = _eventDate;
        eventDetails.eventTime = _eventTime;
    }

    function setUpTicket(
        bytes32 _name,
        uint256 _ticketPrice,
        uint256 _maxNoOfTickets,
        uint256 _numberOfTicketsBought
    ) public onlyOwner {
        ticketCategoryMapping[_name] = TicketCategory({
            categoryName: _name,
            ticketPrice: _ticketPrice,
            maxNoOfTickets: _maxNoOfTickets,
            numberOfTicketsBought: _numberOfTicketsBought
        });
        ticketCategoryArray.push(ticketCategoryMapping[_name]);
    }

    // TODO: Consider removing
    // function getTicketCategoryArraySize() public view returns (uint256 size) {
    //     size = ticketCategoryArray.length;
    // }

    /// @dev To test on bsc testnet if this works
    function getTicketCategoryArraySize() public view returns (uint) {
        return ticketCategoryArray.length;
    }

    /**
    @notice Each wallet can only buy 1 ticket
    */
    function buyTicket(bytes32 _ticketCategory) public payable {
        require(hasBoughtTicket[msg.sender] == false, "Already bought");
        TicketCategory storage ticketCategoryBuying = ticketCategoryMapping[_ticketCategory];
        require(
            ticketCategoryBuying.maxNoOfTickets > ticketCategoryBuying.numberOfTicketsBought,
            "Sold out!"
        );
        require (
            msg.value >= ticketCategoryBuying.ticketPrice,
            "Please pay for ticket"
        );
        hasBoughtTicket[msg.sender] = true;
        ticketCategoryBuying.numberOfTicketsBought +=1;
        tokenId++;
        _safeMint(msg.sender, tokenId);
        emit BuyTicket(msg.sender, _ticketCategory);
    }

    /**
    @dev for organiser to check user in after verifying user's signature
    */
    function checkAttendeeIn(address _attendeeAddress) public onlyOwner {
        checkedIn[_attendeeAddress] = true;
        emit CheckIn(_attendeeAddress, checkedIn[_attendeeAddress]);
    }

    /**
    @notice for event organiser to allow transfer 
    */
    function setCanTransfer(bool _canTransfer) public onlyOwner {
        canTransfer = _canTransfer;
    }

    /**
    @dev bool canTransfer set to disable resale by default
    */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(canTransfer, "Resell not allowed");
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");

        _transfer(from, to, tokenId);
    }

    /**
    @dev bool canTransfer set to disable resale by default
    */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(canTransfer, "Resell not allowed");
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
    @dev bool canTransfer set to disable resale by default
    */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(canTransfer, "Resell not allowed");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner nor approved");
        _safeTransfer(from, to, tokenId, data);
    }

    /** 
    @dev To set ticket image link from ipfs
    */
    function setBaseURI(string memory _ticketImageURL) public onlyOwner {
        baseURISet = _ticketImageURL;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURISet;
    }
}
