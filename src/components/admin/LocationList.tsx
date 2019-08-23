import React from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, SvgIcon, Button } from '@material-ui/core';
import "./LocationList.css"
import { ITravelLocation } from '../../classes/TravelLocation';
import { format } from 'date-fns';
import * as firebase from "firebase/app";
import { IHistoryProps } from '../../classes/IHistoryProps';
import { FirestoreHelper } from '../../util/FirestoreHelper';


interface ILocationListProps {
    locs?: ITravelLocation[]
    history: IHistoryProps
}
interface ILocationListState {
    locs: ITravelLocation[]
}

class LocationList extends React.Component {

    public props: ILocationListProps
    public state: ILocationListState

    constructor(props: ILocationListProps) {
        super(props);
        this.props = props;

        let locs = this.props.locs
        if (!locs) {
            locs = []
        }
        this.state = {
            locs: locs
        }
        if (locs.length === 0) {
            FirestoreHelper.loadLocations((locs) => {
                this.setState({ locs: locs })
            })
        }
    }

    createLocation() {
        this.props.history.push('/notadmin/locationentry')
    }

    viewLocation(loc: ITravelLocation) {
        this.props.history.push(`/notadmin/location/${loc.id}`)
    }

    edit(loc: ITravelLocation): void {
        this.props.history.push(`/notadmin/locationentry/${loc.id}`)
    }

    delete(loc: ITravelLocation): void {
        let name = loc.name
        // TODO: Figure out how to show a confirmation dialog
        if (false) {
            // if this one doens't work, use the one commented out below
            firebase.firestore().collection("locations").doc(loc.id).delete().then(function() {
                console.log("Location '" + name + "' removed")
            }).catch(function(error) {
                console.error("Error removing location", error)
            })
            // firebase.firestore().collection("locations").where("id", "==", loc.id).get().then(function(querySnapshot) {
            //     querySnapshot.forEach(function(doc) {
            //         doc.ref.delete();
            //     })
            // })
        }
        console.log("Would delete: " + loc.name);
    }

    render() {
        return (
            <Paper className="root">
                <Button variant="outlined" onClick={() => { this.createLocation() }}>
                    Add Location
                </Button>
                <Table className="location-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Arrive</TableCell>
                            <TableCell align="right">Depart</TableCell>
                            <TableCell align="right">Latitude</TableCell>
                            <TableCell align="right">Longitude</TableCell>
                            <TableCell align="center">Actions</TableCell>
                            <TableCell align="center">Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.locs.map(loc => (
                            <TableRow key={loc.id}>
                                <TableCell component="th" scope="row">
                                    {loc.name}
                                </TableCell>
                                <TableCell align="right">{format(loc.arrive.toDate(), "MMM do, yyyy")}</TableCell>
                                <TableCell align="right">{format(loc.depart.toDate(), "MMM do, yyyy")}</TableCell>
                                <TableCell align="right">{loc.coords.latitude}</TableCell>
                                <TableCell align="right">{loc.coords.longitude}</TableCell>
                                <TableCell align="center">
                                    <IconButton aria-label="Edit" onClick={() => { this.edit(loc) }}>
                                        <SvgIcon>
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /><path d="M0 0h24v24H0z" fill="none" />
                                        </SvgIcon>
                                    </IconButton>
                                    {/* <IconButton aria-label="Delete" onClick={() => { this.delete(loc) }}>
                                        <SvgIcon>
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /><path d="M0 0h24v24H0z" fill="none" />
                                        </SvgIcon>
                                    </IconButton> */}
                                </TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" onClick={() => { this.viewLocation(loc) }}>
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

export default LocationList;