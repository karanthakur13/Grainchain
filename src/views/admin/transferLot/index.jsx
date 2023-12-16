import { React, useState, useEffect } from "react";
import Scanner from "components/scanner";
import Card from "components/card";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  Select,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import GrainNft from "../abis/GrainNft.json";
const TransferLot = () => {
  const [shipmentData, setShipmentData] = useState("");
  const [num, setNum] = useState(0);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [form, setForm] = useState({
    destAcc: "",
  });
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const data = new ethers.Contract(
      "0x0c13eBe2D69b3F16Ca87B61BbA887B3BeC206184",
      GrainNft,
      provider
    );
    setContract(data);
  };
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
  };
  useEffect(() => {
    connectHandler();
  }, []);
  useEffect(() => {
    loadBlockchainData();
  }, []);
  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };
  const handleGrainChange = (e) => {
    handleFormFieldChange("gtype", e);
  };

  const handleScanResult = (result) => {
    setShipmentData(result);
    const parsedNum = parseInt(result);
    setNum(parsedNum);
  };
  const transferOrder = async (from, to, num) => {
    const signer = await provider.getSigner();
    let transaction = await contract
      .connect(signer)
      .transferFrom(from, to, num);
    const receipt = await transaction.wait();

    return { success: true, receipt };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await transferOrder(account, form.destAcc, num);
    console.log(data);
  };
  return (
    <div className="container mx-auto p-8">
      <Scanner onScanResult={handleScanResult} />
      {shipmentData && (
        <div>
          <Card extra="w-full p-4 h-full">
            <p>Current User Address: {account}</p>
          </Card>

          <Card extra="w-full p-4 h-full">
            <form>
              {/* Image */}
              <FormControl id="image" className="mb-4">
                <FormLabel className="text-lg font-bold">
                  Destination Account Address
                </FormLabel>
                <Input
                  type="string"
                  name="Destinstion address"
                  placeholder="Enter address"
                  className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                  onChange={(e) => handleFormFieldChange("destAcc", e)}
                />
                <FormHelperText className="mt-2 text-gray-600">
                  Enter destination account address, on sepolia-ethereum
                  blockchain
                </FormHelperText>
              </FormControl>
            </form>
          </Card>
          <Card extra="w-full p-4 h-full mt-10">
            <Button
              type="submit"
              colorScheme="blue"
              size="md" // Adjust the size as needed (sm, md, lg)
              mx="auto" // Center the button horizontally
              mt={4}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TransferLot;
