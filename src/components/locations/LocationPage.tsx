import React from 'react'
import './LocationPage.css'
import TravelMap from './TravelMap'
import { ITravelLocation, TravelLocation } from '../../classes/TravelLocation'
import { Post } from '../../classes/Post'
import PostTiles from './PostTiles'
import TripStats from './TripStats'
import { differenceInDays } from 'date-fns'
import { IHistoryProps } from '../../classes/IHistoryProps'
import LocationDetails from './LocationDetails'
import { FirestoreHelper } from '../../util/FirestoreHelper'

interface ILocationPageProps {
    match?: {
        params?: {
            locationName?: string
        }
    }
    history?: IHistoryProps
}

interface ILocationPageState {
    locs: TravelLocation[]
    posts: Post[]
    selectedLocationNameEncoded?: string
    selectedLocation?: ITravelLocation
    countriesVisited: number
    distanceTraveled: number
}

class LocationPage extends React.Component<ILocationPageProps> {

    public state: ILocationPageState;
    public props: ILocationPageProps

    constructor(props: ILocationPageProps) {
        super(props);
        this.props = props;
        const emptyLocations: TravelLocation[] = [];
        const emptyPosts: Post[] = [];
        this.locationChanged = this.locationChanged.bind(this);
        this.postClick = this.postClick.bind(this);
        this.locationsLoaded = this.locationsLoaded.bind(this);
        let locName: string | undefined
        if (this.props.match && this.props.match.params && this.props.match.params.locationName) {
            locName = this.props.match.params.locationName.toLowerCase();
        }
        this.state = { locs: emptyLocations, posts: emptyPosts, selectedLocationNameEncoded: locName, countriesVisited: 0, distanceTraveled: 0 }
        FirestoreHelper.loadLocations(this.locationsLoaded)
    }

    locationsLoaded(locations: ITravelLocation[]): void {
        this.setState({ locs: locations })

        // Try to find the location based on the name passed in
        if (this.state.selectedLocationNameEncoded) {
            // Loop over locations and find the one matching this name
            locations.forEach(loc => {
                if (this.state.selectedLocationNameEncoded && TravelLocation.encode(loc.name) === this.state.selectedLocationNameEncoded) {
                    this.setState({ selectedLocation: loc })
                }
            });
        }
        // Find the location where arrival/departure is around current date
        if (!this.state.selectedLocation) {
            // Find the location we are in and use it
            const now = new Date()
            locations.forEach(loc => {
                if (loc.arrive.toDate() < now && loc.depart.toDate() > now) {
                    this.setState({ selectedLocation: loc })
                }
            });
        }
        // Default to the first location if nothing found yet
        if (!this.state.selectedLocation) {
            this.setState({ selectedLocation: locations[0] })
        }
        if (this.state.selectedLocation) {
            FirestoreHelper.loadPosts(this.state.selectedLocation.id, (posts) => {
                this.setState({ posts: posts })
            })
        }
        this.setState({
            countriesVisited: this.computeCountriesVisited(locations),
            distanceTraveled: this.computeDistanceTraveled(locations)
        })
    }


    locationChanged(locationId: string): void {
        const locations = this.state.locs
        this.setState({ posts: [] })
        locations.forEach(loc => {
            if (loc.id === locationId) {
                if (this.props.history) {
                    this.props.history.push('/location/' + TravelLocation.encode(loc.name))
                } else {
                    console.log('No history object found, falling back')
                }
                this.setState({ selectedLocation: loc })
                FirestoreHelper.loadPosts(loc.id, (posts) => {
                    this.setState({ posts: posts })
                })
            }
        });
    }

    postClick(postID: string): void {
        if (this.props.history) {
            this.props.history.push("/post/" + postID)
        } else {
            alert("NO HISTORY")
        }
    }

    computeCountriesVisited(locs: ITravelLocation[]): number {
        const today = new Date()
        let visited = 0;
        let countryCodeSet = new Set();
        for (const loc of locs) {
            if (countryCodeSet.has(loc.countrycode)) {
                continue;
            }
            countryCodeSet.add(loc.countrycode);

            if (today > loc.arrive.toDate()) {
                visited++;
            }
        }
        return visited;
    }

    computeDistanceTraveled(locations: ITravelLocation[]): number {
        let total = 0;
        const now = new Date()
        locations.forEach(loc => {
            if (loc.arrive.toDate() < now && loc.distance) {
                total += loc.distance
            }
        });
        return total;
    }

    render() {
        const daysOnTheRoad = Math.max(differenceInDays(new Date(), new Date(2019, 10, 11)), 0)
        const center = this.state.selectedLocation && this.state.selectedLocation.coordinates && this.state.selectedLocation.coordinates.length > 0 ?
            this.state.selectedLocation.coordinates[0] : undefined
        return (
            <div className="App">
                <div className="App-header"><TripStats daysOnTheRoad={daysOnTheRoad} countriesVisited={this.state.countriesVisited} milesTraveled={this.state.distanceTraveled} /></div>
                <div className="App-details"><LocationDetails locations={this.state.locs} onLocChange={this.locationChanged} selectedLocation={this.state.selectedLocation} /></div>
                <div className="App-map"><TravelMap locations={this.state.locs} onLocChange={this.locationChanged} center={center} /></div>
                <div className="App-posts"><PostTiles posts={this.state.posts} onPostClick={this.postClick} /></div>
            </div>
        );
    }
}

export default LocationPage;
