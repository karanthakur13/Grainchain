// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/eip/interface/IERC721Supply.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GrainChain is ERC721URIStorage, IERC721Supply {
    uint256 private tokenIdCounter;

    event NFTCreated(uint256 tokenId);
    struct Locate {
        string latitude;
        string longitude;
    }
    struct State {
        address ownership;
        string description;
        uint256 timestamp;
        uint256 weight;
        string certificate;
        int256 temp;
        int humidity;
        Locate location;
        int256 exceededTemp;
    }

    struct Lot_Token {
        uint256 tokenId;
        address manufacturer;
        string gtype;
        State[] states;
    }

    mapping(uint256 => Lot_Token) public allLots;
    mapping(uint256 => address) public ownerOfToken;

    constructor() ERC721("GrainNFT", "GNFT") {
        tokenIdCounter = 1;
    }

    function getLot(uint256 tokenId) public view returns (Lot_Token memory) {
        return allLots[tokenId];
    }

    function totalSupply() public view override returns (uint256) {
        return tokenIdCounter;
    }

    function createLotNFT(
        string memory _gtype,
        string memory _gdesc,
        string memory _certiUrl,
        uint256 _weight,
        string memory _lati,
        string memory _longi,
        int256 _temp,
        int256 _humidity,
        int256 _exct
    ) public {
        _mint(msg.sender, tokenIdCounter);
        Lot_Token storage lot = allLots[tokenIdCounter];
        lot.tokenId = tokenIdCounter;
        lot.manufacturer = msg.sender;
        lot.gtype = _gtype;
        lot.states.push(
            State({
                ownership: msg.sender,
                description: _gdesc,
                timestamp: block.timestamp,
                weight: _weight,
                certificate: _certiUrl,
                temp: _temp,
                humidity: _humidity,
                location: Locate({latitude: _lati, longitude: _longi}),
                exceededTemp: _exct
            })
        );
        tokenIdCounter++;
    }

    function updateLotNFT(
        uint256 _gid,
        string memory _gdesc,
        string memory _certiUrl,
        uint256 _weight,
        string memory _lati,
        string memory _longi,
        int256 _temp,
        int256 _humidity,
        int256 _exct
    ) public returns (bool) {
        Lot_Token storage lot = allLots[_gid];

        lot.states.push(
            State({
                ownership: msg.sender,
                description: _gdesc,
                timestamp: block.timestamp,
                weight: _weight,
                certificate: _certiUrl,
                temp: _temp,
                humidity: _humidity,
                location: Locate({latitude: _lati, longitude: _longi}),
                exceededTemp: _exct
            })
        );
        return true;
    }

    /*    function searchProduct(uint256 _gid) public view returns (State[] memory) {
        Lot_Token storage lot = allLots[_gid];
        return (lot.states);
    } */

    function publishNFT(string memory _tokenURI) public {
        _setTokenURI(tokenIdCounter - 1, _tokenURI);

        emit NFTCreated(tokenIdCounter - 1);
    }

    // Helper function to convert uint256 to string
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
