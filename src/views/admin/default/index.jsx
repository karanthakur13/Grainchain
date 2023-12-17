import { React, useState, useEffect } from "react";
import Scanner from "components/scanner";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { ethers } from "ethers";
import GrainNft from "../abis/GrainNft.json";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [shipmentData, setShipmentData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [num, setNum] = useState(0);
  const [info, setInfo] = useState();
  const [Oinfo, setOInfo] = useState();
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

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

    return lot;
  };

  const SearchO = async (_gid) => {
    const owner = await contract.ownerOf(_gid);
    return owner;
  };

  const fetchproduct = async (_gid) => {
    setIsLoading(true);
    const data = await Search(num);
    const odata = await SearchO(num);
    setInfo(data);
    setOInfo(odata);
    setIsLoading(false);
  };

  const handleMarkerClick = (markerLabel) => {
    console.log(`Marker ${markerLabel} clicked!`);

    const markerInfo = info.states[markerLabel - 1];
    const timestamp = markerInfo[2].toNumber();
    const weight = markerInfo[3].toNumber();
    const temperature = markerInfo[5].toNumber();
    const humidity = markerInfo[6].toNumber();
    const exceededTemp = markerInfo[8].toNumber();
    const date = new Date(timestamp * 1000);
    let qlog;
    if (exceededTemp === 0) {
      qlog = "Fit for consumption";
    } else {
      qlog = "Not fit for consumption";
    }

    setSelectedState({
      addressOwnership: markerInfo[0],
      description: markerInfo[1],
      certificate: markerInfo[4],
      timestamp: date.toLocaleString(),
      weight: weight,
      certificate: markerInfo[4],
      temp: temperature,
      humidity: humidity,
      location: markerInfo[7],
      exceededTemp: qlog,
    });
  };

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    console.log(ethers.version);

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

  return (
    <div className="container mx-auto p-8">
      <Scanner onScanResult={handleScanResult} />
      {info && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          style={{
            margin: "20px",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
            background: "#fff",
            color: "#444",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "60vh",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <InfoBox label="Grain-ID" value={info[0].toNumber()} />
              <InfoBox label="Manufacturer" value={info[1]} />
              <InfoBox label="Current Owner" value={Oinfo} />
              <InfoBox label="Grain type" value={info[2]} />
            </div>

            <APIProvider apiKey="AIzaSyAu1pHyPLT7wuyKmDSJ3oYezHGDbl2HCWU">
              <Map
                center={{
                  lat: parseFloat(info.states[0].location.latitude),
                  lng: parseFloat(info.states[0].location.longitude),
                }}
                zoom={5}
              >
                {info.states.map((state, index) => (
                  <Marker
                    key={index}
                    position={{
                      lat: parseFloat(state.location.latitude),
                      lng: parseFloat(state.location.longitude),
                    }}
                    label={(index + 1).toString()}
                    onClick={() => handleMarkerClick(index + 1)}
                  />
                ))}
              </Map>
            </APIProvider>
          </div>

          <div
            style={{
              marginTop: "20px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              background: "#f8f8f8",
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridGap: "20px",
            }}
          >
            <InfoBox
              label="Ownership Address "
              value={selectedState?.addressOwnership}
            />
            <InfoBox label="Description" value={selectedState?.description} />
            <InfoBox label="Certificate" value={selectedState?.certificate} />
            <InfoBox label="Timestamp" value={selectedState?.timestamp} />
            <InfoBox label="Weight" value={selectedState?.weight} />
            <InfoBox label="Temperature" value={selectedState?.temp} />
            <InfoBox label="Humidity" value={selectedState?.humidity} />
            <InfoBox label="Quality Log" value={selectedState?.exceededTemp} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleBoxClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const displayValue =
    typeof value === "object" ? JSON.stringify(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "14px",
          color: "#444",
        }}
      >
        {label}
      </strong>
      <span style={{ fontSize: "16px", color: "#666" }}>{displayValue}</span>

      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
              zIndex: 1,
            }}
          >
            <p>Additional information..</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
