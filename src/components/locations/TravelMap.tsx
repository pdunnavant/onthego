/// <reference types="googlemaps" />
import React from 'react'
import GoogleMapReact from 'google-map-react'
import MapMarker from './MapMarker'
import { ITravelLocation } from '../../classes/TravelLocation'
import { ILocChangeCallback } from '../../classes/ILocChangeCallback'
import './TravelMap.css'
import * as firebase from "firebase/app"

interface IMapProps {
    locations: ITravelLocation[]
    center?: firebase.firestore.GeoPoint
    onLocChange: ILocChangeCallback
    fullscreen?: boolean
}

const DefaultZoom = 6
const DefaultZoomFullScreen = 3

class TravelMap extends React.Component<IMapProps> {

    public props: IMapProps
    private map: google.maps.Map | undefined;
    private maps: any;

    constructor(props: IMapProps) {
        super(props);
        this.props = props;
    }

    handleApiLoaded(map: google.maps.Map, maps: any) {
        this.map = map;
        this.maps = maps;
        this.drawPaths();
    }
    drawPaths() {
        if (this.map === undefined || this.maps === undefined) {
            return;
        }
        const pathCoords = this.buildFlightPlanCoordinates(this.props.locations)

        const upcomingPath = new this.maps.Polyline({
            path: pathCoords.upcoming,
            geodesic: true,
            strokeColor: '#AAADC4',
            strokeOpacity: 1,
            strokeWeight: 3
        });
        upcomingPath.setMap(this.map);

        const traveledPath = new this.maps.Polyline({
            path: pathCoords.traveled,
            geodesic: true,
            strokeColor: '#3E442B',
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
        traveledPath.setMap(this.map);
    }

    buildFlightPlanCoordinates(locs: ITravelLocation[]) {
        const now: Date = new Date()
        const traveledPath = [];
        const upcomingPath = [];

        for (const loc of locs) {
            if (loc.arrive === undefined || loc.arrive.toDate() < now) {
                for (let c of loc.coordinates) {
                    traveledPath.push({
                        lat: c.latitude,
                        lng: c.longitude
                    });
                }
            }
            if (loc.depart === undefined || loc.depart.toDate() > now) {
                for (let c of loc.coordinates) {
                    upcomingPath.push({
                        lat: c.latitude,
                        lng: c.longitude
                    });
                }
            }

        }

        return {
            traveled: traveledPath,
            upcoming: upcomingPath
        };
    }

    buildMarkers() {
        const markers: any = this.props.locations.map(loc => {
            if (!loc.coordinates || loc.coordinates.length === 0) {
                return null
            }
            return (
                <MapMarker
                    lat={loc.coordinates[0].latitude}
                    lng={loc.coordinates[0].longitude}
                    text={loc.name}
                    key={loc.id}
                    locationid={loc.id}
                    onLocChange={this.props.onLocChange}
                />
            );
        });
        return markers;
    }
    render() {
        if (!this.props.center) {
            return (<div className={this.props.fullscreen ? "MapFullscreen" : "TravelMap"}>Loading...</div>)
        }
        const center = this.props.center
        this.drawPaths()

        return (
            // Important! Always set the container height explicitly
            <div className={this.props.fullscreen ? "MapFullscreen" : "TravelMap"}>
                <GoogleMapReact
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
                    bootstrapURLKeys={{ key: 'AIzaSyDOkkJbGg-n39NsLihqZACkGYOiTDDMMd4' }}
                    center={{ lat: center.latitude, lng: center.longitude }}
                    defaultZoom={this.props.fullscreen ? DefaultZoomFullScreen : DefaultZoom}>
                    {this.buildMarkers()}
                </GoogleMapReact>
            </div>
        );
    }
}

export default TravelMap;
