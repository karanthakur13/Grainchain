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
  Box,
  Text,
  Select,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import GrainNft from "../abis/GrainNft.json";
const WarehouseLogsItem = ({ label, value }) => {
  return (
    <Box mb={4}>
      <Text fontSize="lg" fontWeight="bold" color="navy.700" mb={1}>
        {label}
      </Text>
      <Text color="black">{value}</Text>
    </Box>
  );
};

const WarehouseLogs = ({ latitude, longitude, currentDateTime, account }) => {
  return (
    <Box mb={8} w="full" rounded-lg p={4} shadow="md">
      <Text fontSize="xl" fontWeight="bold" color="#1A365D" mb={4}>
        Warehouse Logs
      </Text>
      <WarehouseLogsItem label="Latitude" value={latitude} />
      <WarehouseLogsItem label="Longitude" value={longitude} />
      <WarehouseLogsItem
        label="Date"
        value={currentDateTime.toLocaleDateString()}
      />
      <WarehouseLogsItem
        label="Time"
        value={currentDateTime.toLocaleTimeString()}
      />
      <WarehouseLogsItem label="Temperature" value="10" />
      <WarehouseLogsItem label="Humidity" value="10" />
      <WarehouseLogsItem label="User" value={account} />
    </Box>
  );
};

const UpdateOrder = () => {
  const [shipmentData, setShipmentData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [num, setNum] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [latitude, setLatitude] = useState("");
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [longitude, setLongitude] = useState("");
  const [form, setForm] = useState({
    gdesc: "",
    gcerti: "",
    gweight: "",
  });

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
    connectHandler();
  }, []);
  useEffect(() => {
    loadBlockchainData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
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
  const updateOrder = async (form, latitude, longitude) => {
    const signer = await provider.getSigner();
    let transaction = await contract
      .connect(signer)
      .updateLotNFT(
        num,
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
    const data = await updateOrder(
      {
        ...form,
      },
      latitude,
      longitude
    );
    console.log(data);
  };
  const handleScanResult = (result) => {
    setShipmentData(result);
    const parsedNum = parseInt(result);
    setNum(parsedNum);
  };
  const handleGrainChange = (e) => {
    handleFormFieldChange("gtype", e);
  };
  return (
    <div className="container mx-auto p-8">
      <Scanner onScanResult={handleScanResult} />
      {shipmentData && (
        <div>
          <div className="flex gap-4">
            <Card extra="w-full p-4 h-full">
              <form>
                {/* Image */}
                <FormControl id="image" className="mb-4">
                  <FormLabel className="text-lg font-bold">
                    Grain Description
                  </FormLabel>
                  <Input
                    type="url"
                    name="description"
                    placeholder="Enter description"
                    className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => handleFormFieldChange("gdesc", e)}
                  />
                  <FormHelperText className="mt-2 text-gray-600">
                    Enter grain description.
                  </FormHelperText>
                </FormControl>

                <FormControl id="image" className="mb-4">
                  <FormLabel className="text-lg font-bold">
                    Grain Certificate
                  </FormLabel>
                  <Input
                    type="url"
                    name="certificate"
                    placeholder="Enter certificate URL"
                    className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => handleFormFieldChange("gcerti", e)}
                  />
                  <FormHelperText className="mt-2 text-gray-600">
                    Enter URL for grain certificate.
                  </FormHelperText>
                </FormControl>

                {/* Weight */}
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
            <Card extra="w-full p-4 h-full bg-green-200 rounded-lg shadow-md">
              <WarehouseLogs
                latitude={latitude}
                longitude={longitude}
                currentDateTime={currentDateTime}
                account={account}
              />
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
        </div>
      )}
    </div>
  );
};

export default UpdateOrder;
