import React, {useState, useEffect} from 'react'
import ReactGlobe from 'react-globe';
import axios from 'axios';
import './globe.css'
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
// import defaultMarkers from "./markers.js"; // COMMENTED defaultMarkers - ANDY
import covidCountries from "./covidMarkers.json";
// FORMATTING COVID LIST TO MATCH GLOBE REACT PARAMETERS - ANDY ADD
for(var i=0; i<covidCountries.length; i++){
  covidCountries[i].value = (i+1)
  covidCountries[i].id = (i+1)
  covidCountries[i].color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
}
////////////////////////////////////////////////////////
function markerTooltipRenderer(marker) {
  return `COUNTRY: ${marker.country} (Value: ${marker.value})`;
}
const options = {
  markerTooltipRenderer,
  ambientLightColor: 'red',
  globeGlowColor: 'blue'
};
function Globe() {
  const randomMarkers = covidCountries.map((marker) => ({
    ...marker,
    value: Math.floor(Math.random() * 100)
  }));
  const [markers, setMarkers] = useState([]);
  const [event, setEvent] = useState(null);
  const [details, setDetails] = useState(null);
  ///////////////////////////////////////
  // THIS FUNCTION MAKES API CALL TO COVID DATA
  // AND THEN ADDS THE DATA TO THE COUNTRY OBJECT
  useEffect(() => {
    var options = {
      method: 'GET',
      url: 'https://covid-19-tracking.p.rapidapi.com/v1',
      headers: {
        'x-rapidapi-key': 'aa4bbfbbc6msh943bc8aba837399p1827ebjsnde6bed3202fa',
        'x-rapidapi-host': 'covid-19-tracking.p.rapidapi.com'
      }
    };
    axios.request(options).then(function (response) {
      var covidData = response.data
      console.log(covidData[0][`Active Cases_text`]);
      // THIS LOOP ADDS THE COVID DATA TO THE CORRESPONDING COUNTRY OBJECT
      for(var i=0;i<randomMarkers.length; i++){
          randomMarkers[i].activeCases = response.data[randomMarkers[i].covidIndex][`Active Cases_text`]
          randomMarkers[i].newCases = response.data[randomMarkers[i].covidIndex][`New Cases_text`]
          randomMarkers[i].newDeaths = response.data[randomMarkers[i].covidIndex][`New Deaths_text`]
          randomMarkers[i].totalCases = response.data[randomMarkers[i].covidIndex][`Total Cases_text`]
          randomMarkers[i].totalDeaths = response.data[randomMarkers[i].covidIndex][`Total Deaths_text`]
          randomMarkers[i].totalRecovered = response.data[randomMarkers[i].covidIndex][`Total Recovered_text`]
      }
      // EVERYTHING CONSOLE LOGS OUT SO FAR...
      console.log(randomMarkers);
    }).catch(function (error) {
      console.error(error);
    });
  })
  // ANDY ADD ENDS
  ////////////////////////////////////////
  function onClickMarker(marker, markerObject, event) {
    setEvent({
      type: "CLICK",
      marker,
      markerObjectID: markerObject.uuid,
      pointerEventPosition: { x: event.clientX, y: event.clientY }
    });
    setDetails(markerTooltipRenderer(marker));
  }
  function onDefocus(previousFocus) {
    setEvent({
      type: "DEFOCUS",
      previousFocus
    });
    setDetails(null);
  }
  return (
    <div>
      {details && (
        <div
          style={{
            background: "white",
            position: "absolute",
            fontSize: 20,
            bottom: 0,
            right: 0,
            padding: 12
          }}
        >
          <p>{details}</p>
          <p>
            EVENT: type={event.type}, position=
            {JSON.stringify(event.pointerEventPosition)}
          </p>
        </div>
      )}
      <div style={{ padding: 32 }}>
        <button onClick={() => setMarkers(randomMarkers)}>
          Randomize markers
        </button>
        <button disabled={markers.length === 0} onClick={() => setMarkers([])}>
          Clear markers
        </button>
        <button
          disabled={markers.length === randomMarkers.length}
          onClick={() =>
            setMarkers([...markers, randomMarkers[markers.length]])
          }
        >
          Add marker
        </button>
        <button
          disabled={markers.length === 0}
          onClick={() => setMarkers(markers.slice(0, markers.length - 1))}
        >
          Remove marker
        </button>
      </div>
      <ReactGlobe
        height="100vh"
        markers={markers}
        options={options}
        width="100vw"
        onClickMarker={onClickMarker}
        onDefocus={onDefocus}
      />
    </div>
  );
}
export default Globe