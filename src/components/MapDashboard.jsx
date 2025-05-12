import { useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Legend from "@arcgis/core/widgets/Legend";

export default function App() {
  const mapDiv = useRef(null);
  const [selectedOption, setSelectedOption] = useState("NO2");
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mapRef = useRef(null);
  const mapViewRef = useRef(null);
  const legendRef = useRef(null); // Track legend

  const stateFiles = [
    "cmaq_hyb_ramp_MA.json"
  ];

  const maCoordinates = [-71.0589, 42.3601]; // Boston, MA

  useEffect(() => {
    if (mapDiv.current) {
      const map = new Map({ basemap: "streets", layers: [] });
      const mapView = new MapView({
        container: mapDiv.current,
        center: maCoordinates,
        zoom: 8,
        map: map,
      });
      mapRef.current = map;
      mapViewRef.current = mapView;

      return () => mapView?.destroy();
    }
  }, []);

  // Reset files and selectedFiles when pollutant changes
  useEffect(() => {
    setFiles(stateFiles);
    setSelectedFiles([]);
    setIsDropdownOpen(false);

    // Clean up old layers and legend
    if (mapRef.current) {
      mapRef.current.removeAll();
    }
    if (mapViewRef.current && legendRef.current) {
      mapViewRef.current.ui.remove(legendRef.current);
      legendRef.current = null;
    }
  }, [selectedOption]);

  const handleFileSelection = (file) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(file)) {
        return prevSelectedFiles.filter((f) => f !== file);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current || !mapViewRef.current || selectedFiles.length === 0) return;

    // Remove existing layers
    mapRef.current.removeAll();

    // Also remove previous legend
    if (legendRef.current) {
      mapViewRef.current.ui.remove(legendRef.current);
      legendRef.current = null;
    }

    selectedFiles.forEach((file) => {
      const folder = selectedOption === "NO2" ? "NO2" : "PM2.5";
      fetch(`/${folder}/${file}`)
        .then((res) => res.json())
        .then((data) => {
          const geoJsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          const geoJsonUrl = URL.createObjectURL(geoJsonBlob);

          const geojsonLayer = new GeoJSONLayer({
            url: geoJsonUrl,
            popupTemplate: {
              title: "Site Info",
              content: `
                <b>Block ID:</b> {blockid10}<br>
                <b>CMAQ:</b> {CMAQ} μg/m³<br>
                <b>Hyb:</b> {Hyb} μg/m³<br>
                <b>RAMP:</b> {RAMP} μg/m³<br>
              `,
            },
            renderer: {
              type: "simple",
              symbol: {
                type: "simple-marker",
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 0.5
                }
              },
              visualVariables: [
                {
                  type: "color",
                  field: "RAMP",
                  stops: [
                    { value: 1, color: "#ffffcc", label: "Low (1–5)" },
                    { value: 5, color: "#ffffcc" },
                    { value: 5.01, color: "#ffeda0", label: "Moderate (5–10)" },
                    { value: 10, color: "#ffeda0" },
                    { value: 10.01, color: "#feb24c", label: "High (10–15)" },
                    { value: 15, color: "#feb24c" },
                    { value: 15.01, color: "#f03b20", label: "Very High (15–19)" },
                    { value: 19, color: "#f03b20" }
                  ]
                }
              ]
            }
          });

          mapRef.current.add(geojsonLayer);

          // Add legend once for the first layer
          if (!legendRef.current) {
            legendRef.current = new Legend({
              view: mapViewRef.current,
              layerInfos: [{
                layer: geojsonLayer,
                title: "RAMP μg/m³"
              }]
            });
            mapViewRef.current.ui.add(legendRef.current, "bottom-right");
          }
        });
    });
  }, [selectedFiles, selectedOption]);

  return (
      <div className="h-screen flex">
      <div className="w-1/5 p-4 bg-gray-100">
        <h3 className="font-bold text-lg mb-4">Select Option</h3>
        <select
          className="w-full border p-2"
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            setSelectedFiles([]); // Reset files on dropdown change
            setIsDropdownOpen(false); // Optional: close dropdown
          }}
        >
          <option value="NO2">NO2</option>
          <option value="PM2.5">PM2.5</option>
        </select>

        <div className="relative mt-4">
          <h3 className="font-bold text-lg mb-2">
            Select {selectedOption} Files
          </h3>
          <button
            className="w-full border p-2 text-left"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedFiles.length > 0
              ? `${selectedFiles.length} selected`
              : '-- Select Files --'}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border shadow-lg max-h-60 overflow-auto">
              {files.map((file, index) => (
                <div key={index} className="p-2 hover:bg-gray-100">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file)}
                      onChange={() => handleFileSelection(file)}
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