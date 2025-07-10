const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  // 1. Kontraktlarni deploy qilish
  const KYCFacet = await ethers.getContractFactory("KYCFacet");
  const kycFacet = await KYCFacet.deploy();
  await kycFacet.deployed();
  console.log("KYCFacet deployed to:", kycFacet.address);

  const RiskFacet = await ethers.getContractFactory("RiskFacet");
  const riskFacet = await RiskFacet.deploy();
  await riskFacet.deployed();
  console.log("RiskFacet deployed to:", riskFacet.address);

  const LaunchFacet = await ethers.getContractFactory("LaunchFacet");
  const launchFacet = await LaunchFacet.deploy();
  await launchFacet.deployed();
  console.log("LaunchFacet deployed to:", launchFacet.address);

  // 2. Diamond kontraktni deploy qilish
  const Diamond = await ethers.getContractFactory("PulseForgeDiamond");
  const diamond = await Diamond.deploy();
  await diamond.deployed();
  console.log("Diamond deployed to:", diamond.address);

  // 3. DiamondCut orqali facetlarni ulash
  const diamondCut = await ethers.getContractAt("PulseForgeDiamond", diamond.address);
  
  // Har bir facetning function selectorlarini to'plash
  const kycFacetSelectors = ["0x6d5e3032"]; // simpleKYC()
  const riskFacetSelectors = ["0x4c5c3ace"]; // getDummyRiskScore()
  const launchFacetSelectors = ["0x4b94f50e"]; // simpleLaunch()

  const cuts = [
    {
      facetAddress: kycFacet.address,
      functionSelectors: kycFacetSelectors
    },
    {
      facetAddress: riskFacet.address,
      functionSelectors: riskFacetSelectors
    },
    {
      facetAddress: launchFacet.address,
      functionSelectors: launchFacetSelectors
    }
  ];

  await diamondCut.diamondCut(cuts, ethers.constants.AddressZero, "0x");
  console.log("Diamond cut successful!");

  // 4. Kontrakt manzillarini faylga yozish (frontend uchun)
  const addresses = {
    KYC_ADDRESS: kycFacet.address,
    RISK_ADDRESS: riskFacet.address,
    LAUNCH_ADDRESS: launchFacet.address,
    DIAMOND_ADDRESS: diamond.address
  };

  fs.writeFileSync('../frontend/.env', 
    `REACT_APP_KYC_ADDRESS=${addresses.KYC_ADDRESS}\n` +
    `REACT_APP_RISK_ADDRESS=${addresses.RISK_ADDRESS}\n` +
    `REACT_APP_LAUNCH_ADDRESS=${addresses.LAUNCH_ADDRESS}\n` +
    `REACT_APP_DIAMOND_ADDRESS=${addresses.DIAMOND_ADDRESS}`
  );
  console.log("Contract addresses saved to frontend/.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
