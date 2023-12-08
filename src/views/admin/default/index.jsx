import { React, useState, useEffect } from "react";
import Scanner from "components/scanner";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Marker,
} from "@vis.gl/react-google-maps";
import { ethers } from "ethers";
import GrainNft from "../abis/GrainNft.json";

const Dashboard = () => {
  const [shipmentData, setShipmentData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [num, setNum] = useState(0);
  const [info, setInfo] = useState();
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  useEffect(() => {
    if (num !== null) {
      fetchproduct();
    }
  }, [num]);

  const Search = async (_gid) => {
    const lot = await contract.getLot(_gid);
    console.log(lot);
    return lot;
  };

  const fetchproduct = async (_gid) => {
    setIsLoading(true);
    const data = await Search(num);
    setInfo(data);
    setIsLoading(false);
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

  const handleScanResult = (result) => {
    setShipmentData(result);
    const parsedNum = parseInt(result);
    setNum(parsedNum);
  };
  const coordinates = [
    { lat: 30.35529948136283, lng: 76.36943012658881 },
    { lat: 28.7041, lng: 77.1025 },
  ];
  return (
    <div>
      <Scanner onScanResult={handleScanResult} />
      {shipmentData && (
        <div style={{ height: "100vh", width: "100%" }}>
          <APIProvider apiKey="AIzaSyAu1pHyPLT7wuyKmDSJ3oYezHGDbl2HCWU">
            <Map
              center={coordinates[0]}
              zoom={10}
              mapId={process.env.NEXT_PUBLIC_MAP_ID}
            >
              {/* Add markers for each coordinate with numbers */}
              {coordinates.map((coord, index) => (
                <Marker
                  key={index}
                  position={coord}
                  label={(index + 1).toString()}
                />
              ))}
            </Map>
          </APIProvider>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
