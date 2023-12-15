import { React, useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  Select,
} from "@chakra-ui/react";
import Card from "components/card";
import GrainNft from "../abis/GrainNft.json";
import { ethers } from "ethers";
import QrCode from "qrcode";
import { FaAddressBook } from "react-icons/fa";

const CreateOrder = () => {
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
  const [contract, setContract] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude.toString());
      setLongitude(position.coords.longitude.toString());
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    loadBlockchainData();
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
            {/* Grain Name */}
            <FormControl id="grain" className="mb-4">
              <FormLabel className="text-lg font-bold">Grain Type</FormLabel>
              <Select
                className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
                onChange={handleGrainChange}
              >
                <option className="mt-2 ">Wheat</option>
                <option className="mt-2 ">Rice</option>
              </Select>
              <FormHelperText className="mt-2 text-gray-600">
                Enter the Grain type.
              </FormHelperText>
            </FormControl>

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
        <Card extra={"w-full p-4 h-full"}>
          <div className="mb-8 w-full">
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">
              Warehouse Logs
            </h4>

            <p className="text-black">Latitude : {latitude}</p>
            <p className="text-black"> Longitude : {longitude}</p>
            <p className="text-black">
              Date: {currentDateTime.toLocaleDateString()}
            </p>
            <p className="text-black">
              Time: {currentDateTime.toLocaleTimeString()}
            </p>
            <p className="text-black">Temperature: 10 </p>
            <p className="text-black">Humidity: 10</p>
            <span className=" text-black">Current User Address : 123x</span>
          </div>
        </Card>
      </div>
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

export default CreateOrder;
