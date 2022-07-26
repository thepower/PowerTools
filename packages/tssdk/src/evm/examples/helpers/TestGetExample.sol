// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestGetExample {
    string greeting="Hello";
    bool boolean = true;
    uint8 u8 = 1;
    uint  u256 = 456;
    uint  u = 123; 
    mapping(address => uint) public myMap;
    mapping(uint => string) public helloMap;
    uint[] arr = [1, 2, 3];

    constructor() {
        myMap[0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c] = 256;
        helloMap[0]="Hi";
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting; // set state
    }

    function getBoolean() public view returns (bool) {
        return boolean;
    }
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
    function getMyMap(address _addr) public view returns (uint) {
        return myMap[_addr];
    }
    function getHelloMap(uint _uint) public view returns (string memory) {
        return helloMap[_uint];
    }
    function getArrEl(uint _uint) public view returns (uint) {
        return arr[_uint];
    }
    function getArr() public view returns (uint[] memory) {
        return arr;
    }
    function getHelloMapArrEl(uint _uint) public view returns (string memory,uint) {
        return (helloMap[_uint],arr[_uint]);
    }
}
