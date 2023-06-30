import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

const DECIMALS = 18;
const NAME = "MyToken";
const SYMBOL = "MTK";
const INITIAL_AMOUNT = ethers.utils.parseUnits("1", "18"); // 10^18

describe("MyToken contract", function () {
  let MyToken;
  let myToken: Contract;
  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users: SignerWithAddress[];

  beforeEach(async () => {
    MyToken = await ethers.getContractFactory('MyToken');
    [owner, user1, user2, ...users] = await ethers.getSigners();
    myToken = await MyToken.deploy(NAME, SYMBOL);
  })

  describe("Initial params of contract", async () => {
    it("correct name", async () => {
      console.log(`contract name: ${await myToken.name()}`);
      expect(await myToken.name())
      .to.be.eq(NAME);
    })

    it("correct symbol", async () => {
      console.log(`symbol: ${await myToken.symbol()}`);
      expect(await myToken.symbol())
      .to.be.eq(SYMBOL);
    })

    it("contract owner check", async () => {
      console.log(`owner address: ${await myToken.owner()}`);
      expect(await myToken.owner())
      .to.be.eq(owner.address);
    })

    it("totalSupply check", async () => {
      console.log(`totalSupply: ${await myToken.totalSupply()}`);
      expect(await myToken.totalSupply())
      .to.be.eq(ethers.utils.parseEther("10"));
    })

    it("owner balance check", async () => {
      console.log(`owner balance: ${await myToken.balanceOf(owner.address)}`);
      expect(await myToken.balanceOf(owner.address))
      .to.be.eq(ethers.utils.parseEther("10"));
    })
  })

  describe("Contract logic", function () {
    it("mint require check", async () => {
      await expect(myToken.connect(user1).mint(owner.address, 10000000000))
      .to.be.revertedWith("MyToken: you are not an owner");
    })

    it("mint emit event", async () => {
       expect(await myToken.mint(user1.address, 10))
      .to.emit(myToken, 'Transfer')
      .withArgs("0x0000000000000000000000000000000000000000", user1.address, 10);
    })

    it("transfer check", async () => {
      expect(await myToken.transfer(user1.address, 10000))
      .to.changeTokenBalances(myToken, [owner, user1], [-10000, 10000]);

    })

    it("transfer emit event", async () => {
       expect(await myToken.transfer(user1.address, 10))
      .to.emit(myToken, 'Transfer')
      .withArgs(owner.address, user1.address, 10);
    })

    it("transfer require check", async () => {
      await expect(myToken.connect(user1).transfer(user2.address, 100))
      .to.be.revertedWith('MyToken: Not enough balance')
    })

    it("transferFrom check", async () => {
      let tx = await myToken.approve(user1.address, 10000)
      tx.wait() 
      expect(await myToken.connect(user1).transferFrom(owner.address, user1.address, 100))
      .to.changeTokenBalances(myToken, [owner, user1], [-100, 100]);
    })

    it("transferFrom require check 1", async () => {
      await expect( myToken.connect(user1).transferFrom(owner.address, user1.address, 100))
      .to.be.revertedWith("MyToken: Insufficient allowance");
    })
    it("transferFrom check 2", async () => {
      let tx = await myToken.approve(user1.address, ethers.utils.parseEther("12"))
      tx.wait() 
      await expect( myToken.connect(user1).transferFrom(owner.address, user1.address, ethers.utils.parseEther("11")))
      .to.be.revertedWith("MyToken: Insufficient balance")
    })

    it("transferFrom emit event", async () => {
      let tx = await myToken.approve(user1.address, 10000)
      tx.wait() 
      expect(await myToken.connect(user1).transferFrom(owner.address, user1.address, 100))
      .to.emit(myToken, "Transfer")
      .withArgs(owner.address, user1.address, 100)
   })

    it("burn check", async () => {
      let prevTotalSupply = await myToken.totalSupply()
      let tx = await myToken.burn(ethers.utils.parseEther("5"))
      tx.wait() 
      expect(await myToken.totalSupply())
      .to.be.eq(ethers.utils.parseEther("5"))
    })

    it("burn emit event", async () => {
      await expect(myToken.burn(ethers.utils.parseEther("5")))
      .to.emit(myToken, "Transfer")
      .withArgs(owner.address, "0x0000000000000000000000000000000000000000", ethers.utils.parseEther("5"))
    })

    it.only("allowance check", async () => {
      let tx = await myToken.approve(user1.address, 10000)
      tx.wait() 
      expect(await myToken.allowance(owner.address, user1.address))
      .to.be.eq(10000)
    })

    it("approve emit event", async () => {
      await expect(myToken.approve(user1.address, 10000))
      .to.emit(myToken, "Approval")
      .withArgs(owner.address, user1.address, 10000)
    })
  })
});