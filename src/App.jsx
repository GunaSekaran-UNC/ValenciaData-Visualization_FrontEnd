// import { useEffect, useRef } from "react";
// import "@arcgis/core/assets/esri/themes/light/main.css"; // ArcGIS CSS
// import MapView from "@arcgis/core/views/MapView";
// import Map from "@arcgis/core/Map";
// import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

// export default function App() {
//   const mapDiv = useRef(null);

//   useEffect(() => {
//     if (mapDiv.current) {
//       const geojsonUrl = "converted_data.json"; // Put the file in /public

//       const template = {
//         title: "Site Information",
//         content:
//           "<b>Block ID:</b> {blockid10}<br><b>CMAQ:</b> {CMAQ}<br><b>Hyb:</b> {hyb}<br><b>RAMP:</b> {RAMP}",
//       };

//       const geojsonLayer = new GeoJSONLayer({
//         url: geojsonUrl,
//         popupTemplate: template,
//       });

//       const map = new Map({
//         basemap: "gray-vector",
//         layers: [geojsonLayer],
//       });

//       new MapView({
//         container: mapDiv.current,
//         center: [-88.5, 31.5],
//         zoom: 8,
//         map: map,
//       });
//     }
//   }, []);

//   return (
//     <div className="h-screen w-screen">
//       <div ref={mapDiv} className="w-full h-full" />
//     </div>
//   );
// }

// src/App.js
import React from "react";
import MapDashboard from "./components/MapDashboard";

function App() {
  return <MapDashboard />;
}

export default App;
