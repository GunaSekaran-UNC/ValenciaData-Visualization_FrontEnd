import { useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

export default function App() {
  const mapDiv = useRef(null);
  const [selectedOption, setSelectedOption] = useState("NO2");
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const mapRef = useRef(null);
  const mapViewRef = useRef(null);

  const stateFiles = [
    "cmaq_hyb_ramp_AL.json", "cmaq_hyb_ramp_AR.json", "cmaq_hyb_ramp_AZ.json", "cmaq_hyb_ramp_CA.json",
    "cmaq_hyb_ramp_CO.json", "cmaq_hyb_ramp_CT.json", "cmaq_hyb_ramp_DE.json", "cmaq_hyb_ramp_FL.json",
    "cmaq_hyb_ramp_GA.json", "cmaq_hyb_ramp_IA.json", "cmaq_hyb_ramp_ID.json", "cmaq_hyb_ramp_IL.json",
    "cmaq_hyb_ramp_IN.json", "cmaq_hyb_ramp_KS.json", "cmaq_hyb_ramp_KY.json", "cmaq_hyb_ramp_LA.json",
    "cmaq_hyb_ramp_MA.json", "cmaq_hyb_ramp_MD.json", "cmaq_hyb_ramp_ME.json", "cmaq_hyb_ramp_MI.json",
    "cmaq_hyb_ramp_MN.json", "cmaq_hyb_ramp_MO.json", "cmaq_hyb_ramp_MS.json", "cmaq_hyb_ramp_MT.json",
    "cmaq_hyb_ramp_NC.json", "cmaq_hyb_ramp_ND.json", "cmaq_hyb_ramp_NE.json", "cmaq_hyb_ramp_NH.json",
    "cmaq_hyb_ramp_NJ.json", "cmaq_hyb_ramp_NM.json", "cmaq_hyb_ramp_NV.json", "cmaq_hyb_ramp_NY.json",
    ,"cmaq_hyb_ramp_OH.json","cmaq_hyb_ramp_OK.json","cmaq_hyb_ramp_OR.json", "cmaq_hyb_ramp_PA.json", "cmaq_hyb_ramp_RI.json", 
    "cmaq_hyb_ramp_SC.json","cmaq_hyb_ramp_SD.json", "cmaq_hyb_ramp_TN.json", "cmaq_hyb_ramp_TX.json", 
    "cmaq_hyb_ramp_UT.json","cmaq_hyb_ramp_VA.json","cmaq_hyb_ramp_VT.json", "cmaq_hyb_ramp_WA.json", "cmaq_hyb_ramp_WI.json", 
    "cmaq_hyb_ramp_WV.json","cmaq_hyb_ramp_WY.json"
  ];

  useEffect(() => {
    if (mapDiv.current) {
      const map = new Map({ basemap: "streets", layers: [] });
      const mapView = new MapView({
        container: mapDiv.current,
        center: [-98.5795, 39.8283],
        zoom: 4,
        map: map,
      });
      mapRef.current = map;
      mapViewRef.current = mapView;
      return () => mapView?.destroy();
    }
  }, []);

  useEffect(() => {
    setFiles(stateFiles);
    setSelectedFiles([]);
    setSelectAllChecked(false);
  }, [selectedOption]);

  const handleSelectAllChange = () => {
    if (selectAllChecked) {
      setSelectedFiles([]);
    } else {
      const filesToSelect = files.slice(0, 10);
      setSelectedFiles(filesToSelect);
      setSelectAllChecked(true);
      if (files.length > 10) {
        alert("Due to high data, only the first 10 files are selected.");
      }
    }
  };

  const handleCheckboxChange = (file) => {
    setSelectedFiles((prev) => {
      if (prev.includes(file)) {
        const newSelection = prev.filter((f) => f !== file);
        setSelectAllChecked(false);
        return newSelection;
      } else {
        if (prev.length >= 10) {
          alert("Maximum 10 files can be selected.");
          return prev;
        }
        return [...prev, file];
      }
    });
  };

  useEffect(() => {
    setSelectAllChecked(selectedFiles.length === files.length && files.length > 0);
  }, [selectedFiles, files]);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentLayers = mapRef.current.layers.toArray();

    currentLayers.forEach((layer) => {
      const filename = layer.url?.split("/").pop();
      if (!selectedFiles.includes(filename)) {
        mapRef.current.remove(layer);
      }
    });

    selectedFiles.forEach((file) => {
      if (!currentLayers.some((layer) => layer.url?.split("/").pop() === file)) {
        const folder = selectedOption === "NO2" ? "NO2" : "PM2.5";
        fetch(`http://54.82.29.221:5000/unc-file/${folder}/${file}`)
          .then((res) => res.json())
          .then((data) => {
            const geojsonLayer = new GeoJSONLayer({
              url: data.url,
              popupTemplate: {
                title: "Site Info",
                content: `<b>Block ID:</b> {blockid10}<br><b>CMAQ:</b> {CMAQ}<br><b>Hyb:</b> {hyb}<br><b>RAMP:</b> {RAMP}`,
              },
            });
            mapRef.current.add(geojsonLayer);
          })
          .catch((err) => console.error("Error loading layer:", err));
      }
    });
  }, [selectedFiles, selectedOption]);

  return (
    <div className="h-screen flex">
      <div className="w-1/5 p-4 bg-gray-100">
        <h3 className="font-bold text-lg mb-4">Select Option</h3>
        <select
          className="w-full border p-2"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="NO2">NO2</option>
          <option value="PM2.5">PM2.5</option>
        </select>

        <div className="relative mt-4">
          <h3 className="font-bold text-lg mb-2">
            Select {selectedOption} Files (Max 10)
          </h3>
          <button
            className="w-full border p-2 text-left"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : "-- Select Files --"}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border shadow-lg max-h-60 overflow-auto">
              <div className="p-2 bg-white sticky top-0">
                <label className="flex items-center font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    className="mr-2"
                  />
                  Select All
                </label>
              </div>

              {files.map((file, index) => (
                <div key={index} className="p-2 hover:bg-gray-100">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file)}
                      onChange={() => handleCheckboxChange(file)}
                      className="mr-2"
                    />
                    {file}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div ref={mapDiv} className="h-full w-full" />
      </div>
    </div>
  );
}


