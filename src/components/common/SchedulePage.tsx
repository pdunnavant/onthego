import React from 'react';
import { FirestoreHelper } from "../../util/FirestoreHelper";
import { ITravelLocation, TravelLocation } from '../../classes/TravelLocation';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { format } from 'date-fns';
import './SchedulePage.css'
import { FlagIcon } from '../locations/LocationDetails';
import { TimeStamp } from '../../classes/TimeStamp';
import { IHistoryProps } from '../../classes/IHistoryProps';

interface ISchedulePageProps {
    history?: IHistoryProps
}

interface ISchedulePageState {
    locs: ITravelLocation[]
}

class SchedulePage extends React.Component<ISchedulePageProps> {

    public props: ISchedulePageProps
    public state: ISchedulePageState

    constructor(props: ISchedulePageProps) {
        super(props)
        this.props = props
        this.state = { locs: [] }
        this.locationsLoaded = this.locationsLoaded.bind(this)
        FirestoreHelper.loadLocations(this.locationsLoaded)
    }

    locationsLoaded(locs: ITravelLocation[]) {
        this.setState({
            locs: locs
        })
    }

    formatScheduleDate(ts: TimeStamp): string {
        const startOfTrip = new Date("11/11/2019")
        const endOfTrip = new Date("11/10/2020")
        const date = ts.toDate()
        const hideDatesPast = new Date()
        hideDatesPast.setMonth(hideDatesPast.getMonth() + 2)

        // If before start, show empty
        if (date < startOfTrip || date > endOfTrip) {
            return ""
        }

        // If after 2 months, show TBD
        if (date > hideDatesPast) {
            return "(tbd)"
        }

        return format(date, "MMM do, yyyy")
    }

    rowClicked(loc: ITravelLocation) {
        if (this.props.history) {
            this.props.history.push('/location/' + TravelLocation.encode(loc.name))
        }
    }

    render() {
        return (
            <Paper className="schedule-area">
                <Table className="schedule-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Arrive</TableCell>
                            <TableCell align="right">Depart</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.locs.map(loc => (
                            <TableRow key={loc.id} onClick={() => { this.rowClicked(loc) }}>
                                <TableCell>
                                    {loc.countrycode && loc.countrycode.length > 0 ? <FlagIcon code={loc.countrycode.toLowerCase()} size="lg" /> : ""}
                                    {loc.name}
                                </TableCell>
                                <TableCell align="right">
                                    {this.formatScheduleDate(loc.arrive)}
                                </TableCell>
                                <TableCell align="right">
                                    {this.formatScheduleDate(loc.depart)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}

export default SchedulePage