import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import MapMarker from './MapMarker';

const handleApiLoaded = (map, maps, locations) => {
  const markers = [];
  const infowindows = [];

  var pathCoords = buildFlightPlanCoordinates(locations)

  var traveledPath = new google.maps.Polyline({
    path: pathCoords.traveled,
    geodesic: true,
    strokeColor: '#339944',
    strokeOpacity: 1.0,
    strokeWeight: 4
  });
  traveledPath.setMap(map);
  
  var upcomingPath = new google.maps.Polyline({
    path: pathCoords.upcoming,
    geodesic: true,
    strokeColor: '#0000ff',
    strokeOpacity: 0.2,
    strokeWeight: 3
  });
  upcomingPath.setMap(map);
};

// TODO, Unit test this!
const buildFlightPlanCoordinates = (locations) => {
  const now = Date.now()
  var traveledPath = [];
  const upcomingPath = [];

  for (const loc of locations) {
    if (loc.arrive == null || loc.arrive < now) {
      traveledPath.push({
        lat: loc.lat,
        lng: loc.lng
      });
    }
    if (loc.depart == null || loc.depart > now) {
      upcomingPath.push({
        lat: loc.lat,
        lng: loc.lng
      });
    }

  }

  return {
    traveled: traveledPath,
    upcoming: upcomingPath
  };
};

// TODO, Unit test this!
const currentLocation = (locations) => {
  const now = Date.now()

  for (const loc of locations) {
    if (loc.arrive < now && loc.depart > now) {
      return loc;
    }
  }
};

class TravelMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedCountry: null,
    };
  }

  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  render() {
    const markers = this.props.locations.map(loc => {
      return (
        <MapMarker
            lat={loc.lat}
            lng={loc.lng}
            text={loc.name}
          />
      );
    });
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '50vh', width: '100%' }}>
        <GoogleMapReact
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, this.props.locations)}
          bootstrapURLKeys={{ key: 'AIzaSyBDe1KUNj3px_7kkfl7cfkrEpihDwvunt4' }}
          defaultCenter={currentLocation(this.props.locations)}
          defaultZoom={this.props.zoom}
        >
          {markers}
        </GoogleMapReact>
      </div>
    );
  }
}

export default TravelMap;