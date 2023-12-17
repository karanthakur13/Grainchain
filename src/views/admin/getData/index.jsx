import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Select,
  Box,
  Text,
} from "@chakra-ui/react";
import Card from "components/card";
import GrainNft from "../abis/GrainNft.json";
import { ethers } from "ethers";
import QrCode from "qrcode";
import { FaAddressBook } from "react-icons/fa";

const GetData = () => {
  const [form, setForm] = useState({
    gtype: "",
    gdesc: "",
    gcerti: "",
    gweight: "",
    gtemp: "1",
    ghumidity: "1",
  });
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [url, setUrl] = useState("");

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toString());
      setLongitude(position.coords.longitude.toString());
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://webhook.site/821f5072-8076-480f-927f-1f6dde6bacd6"
        );
        const data = await response.json();

        console.log("Webhook API Response:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    loadBlockchainData();
  }, []);
  useEffect(() => {
    connectHandler();
  }, []);

  useEffect(() => {
    if (qrData) {
      generateQR(qrData);
    }
  }, [qrData]);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const generateQR = async () => {
    try {
      const response = await QrCode.toDataURL(qrData);
      setUrl(response);
    } catch (error) {
      console.error("Error", error);
    }
  };

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

  const createOrder = async (form, latitude, longitude) => {
    const signer = await provider.getSigner();
    let transaction = await contract
      .connect(signer)
      .createLotNFT(
        form.gtype,
        form.gdesc,
        form.gcerti,
        form.gweight,
        latitude,
        longitude,
        10,
        10,
        0
      );
    const receipt = await transaction.wait();

    return { success: true, receipt };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await createOrder(
      {
        ...form,
      },
      latitude,
      longitude
    );
    console.log(data);
    const num = data.receipt.events[0].args[2];
    const numAsString = num.toString();
    setQrData(numAsString);
  };

  const handleGrainChange = (e) => {
    handleFormFieldChange("gtype", e);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex gap-4">
        <Card extra="w-full p-4 h-full">
          <form>
            <FormControl id="image" className="mb-4">
              <FormLabel className="text-lg font-bold">UID</FormLabel>
              <Input
                type="url"
                name="certificate"
                placeholder="Enter grain UID"
                className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                onChange={(e) => handleFormFieldChange("gcerti", e)}
              />
              <FormHelperText className="mt-2 text-gray-600">
                Enter UID for grain information.
              </FormHelperText>
            </FormControl>

            <FormControl id="weight" className="mb-4">
              <FormLabel className="text-lg font-bold">Weight</FormLabel>
              <Input
                type="number"
                name="weight"
                placeholder="Enter weight"
                className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                onChange={(e) => handleFormFieldChange("gweight", e)}
              />
              <FormHelperText className="mt-2 text-gray-600">
                Enter the weight of the grain (kg).
              </FormHelperText>
            </FormControl>
          </form>
        </Card>
      </div>
      <Card extra="w-40 p-4 h-full mx-80 mt-10 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow-md">
        <Button
          type="submit"
          colorScheme="teal"
          size="sm"
          mx="auto"
          mt={4}
          onClick={handleSubmit}
          color="white"
          _hover={{ bg: "purple.600" }}
          _active={{ bg: "purple.800" }}
          _focus={{ outline: "none" }}
          sx={{
            transition:
              "background 0.3s ease-in-out, transform 0.2s ease-in-out",
            transform: "scale(1)",
            _hover: { transform: "scale(1.05)" },
            _active: { transform: "scale(0.95)" },
          }}
        >
          Submit
        </Button>
      </Card>
      {qrData && (
        <div>
          Grain Registered Successfully{" "}
          <div className="mt-[26px] flex items-center justify-center ">
            <img src={url} alt="qrcode" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GetData;
