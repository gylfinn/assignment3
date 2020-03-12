//Sample data for Assignment 3
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
//The following is an example of an array of two events. 
var events = [
    { id: 0, name: "The Whistlers", description: "Romania, 2019, 97 minutes", location: "Bio Paradís, Salur 1", capacity: 40, startDate: new Date(Date.UTC(2020, 02, 03, 22, 0)), endDate: new Date(Date.UTC(2020, 02, 03, 23, 45)), bookings: [0,1,2] },
    { id: 1, name: "HarpFusion: Bach to the Future", description: "Harp ensemble", location: "Harpa, Hörpuhorn", capacity: 100, startDate: new Date(Date.UTC(2020, 02, 12, 15, 0)), endDate: new Date(Date.UTC(2020, 02, 12, 16, 0)), bookings: [] }
];
let nextEventId = 2;
//The following is an example of an array of three bookings.
var bookings = [
    { id: 0, firstName: "John", lastName: "Doe", tel: "+3541234567", email: "", spots: 3},
    { id: 1, firstName: "Jane", lastName: "Doe", tel: "", email: "jane@doe.doe", spots: 1},
    { id: 2, firstName: "Meðaljón", lastName: "Jónsson", tel: "+3541111111", email: "mj@test.is", spots: 5}
];
let nextBookingId = 3;

app.get('/api/v1', (req, res) => {
    return res.status(200).send('Hello World!');
});

app.get('/api/v1/events/', (req, res) => {
    let allEvents = [];
    for (let i=0; i < events.length; i++) {
        let e = {name: events[i].name, id: events[i].id, capacity: events[i].capacity, 
            startDate: events[i].startDate, endDate: events[i].endDate};
        allEvents.push(e);
    }
    return res.status(200).json(allEvents);
});

app.get('/api/v1/events/:eventId', (req, res) => {
    for (let i=0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            return res.status(200).json(events[i]);
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " does not exist."});
});

app.get('/api/v1/events/:eventId/bookings/:bookingId', (req,res) => {
    for (let i=0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            for (let j=0; j < events[i].bookings.length; j++) {
                for (let k=0; k < bookings.length; k ++) {
                    if (events[i].bookings[j] == bookings[k].id) {
                        if (bookings[k].id == req.params.bookingId) {
                            return res.status(200).json(bookings[k])
                        }
                    }
                }
            }
        }
    }
    return res.status(404).json({'message': "Booking not found."})
});

app.get('/api/v1/events/:eventId/bookings', (req,res) => {
    let eventBookings = [];
    for (let i=0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            for (let j=0; j < events[i].bookings.length; j++) {
                for (let k=0; k < bookings.length; k ++) {
                    if (events[i].bookings[j] == bookings[k].id) {
                        eventBookings.push(bookings[k])
                    }
                }
            }
            return res.status(200).json(eventBookings);
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " does not exist."}); 
});

app.delete('/api/v1/events/:eventId/bookings', (req,res) => {
    let returnArray = [];
    for (let i=0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            for (let j = 0; j < events[i].bookings.length; j++) {
                for (k = 0; k < bookings.length; k++) {
                    if (events[i].bookings[j] == bookings[k].id) {
                        returnArray.push(bookings[k]);
                        bookings.splice(k,1);
                    }
                }
            }
            events[i].bookings = [];
            return res.status(200).json(returnArray);
        }
    }
    return res.status(404).json({'message': "Booking not found."})
});

app.delete('/api/v1/events/:eventId/bookings/:bookingId', (req,res) => {
    for (let i=0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            for (let j=0; j < events[i].bookings.length; j++) {
                for (let k=0; k < bookings.length; k ++) {
                    if (events[i].bookings[j] == bookings[k].id) {
                        if (bookings[k].id == req.params.bookingId) {
                            events[i].bookings.splice(j,1);
                            return res.status(200).json(bookings.splice(k,1));
                        }
                    }
                }
            }
        }
    }
    return res.status(404).json({'message': "Booking not found."})
});



app.post('/api/v1/events/:eventId/bookings', (req,res) => {
    if (req.body === undefined || req.body.firstName === undefined || req.body.lastName === undefined || req.body.spots === undefined) {
        return res.status(400).json({'message': "firstName, lastName and spots fields are required in the request body."});
    }
    else if (req.body.tel === undefined && req.body.email === undefined) {
        return res.status(400).json({'message': "Atleast one of email or tel fields are required in the request body."});
    }
    else if (req.body.spots <= 0 || isNaN(Number(req.body.spots))) {
        return res.status(400).json({'message': "Spots have to be a number and greater than 0."});
    }
    else {
        let currEvent;
        for (let i=0; i < events.length; i++) {
            if (events[i].id == req.params.eventId) {
                currEvent = events[i];
            }
        }
        remainingspots = CalculateRemainingCapacity(currEvent);
        if(remainingspots-req.body.spots < 0) {
            return res.status(400).json({'message': "Not enough spots available for your booking."});
        }
        else {
            if (req.body.tel === undefined) {
                var newBooking = {id: nextBookingId, firstName: req.body.firstName, lastName: req.body.lastName,
                tel: "", email: req.body.email, spots: req.body.spots}  
            }
            else if (req.body.email === undefined) {
                var newBooking = {id: nextBookingId, firstName: req.body.firstName, lastName: req.body.lastName,
                tel: req.body.tel, email: "", spots: req.body.spots}  
            }
            else {
                var newBooking = {id: nextBookingId, firstName: req.body.firstName, lastName: req.body.lastName,
                tel: req.body.tel, email: req.body.email, spots: req.body.spots}  
            }
            bookings.push(newBooking);
            nextBookingId++;
            currEvent.bookings.push(newBooking.id);
            return res.status(201).json(newBooking);
        }
    }
});


function CalculateRemainingCapacity(event) {
    let remaining = event.capacity
    for (let i=0; i < event.bookings.length; i++) {
        for (let j=0; j < bookings.length; j ++) {
            if (event.bookings[i] == bookings[j].id) {
                remaining = remaining - bookings[j].spots;
            }
        }
    }
    return remaining
}


app.post('/api/v1/events/', (req, res) => {
    let currentDate = new Date();
    if (req.body === undefined || req.body.name === undefined || req.body.capacity === undefined || req.body.startDate === undefined || req.body.endDate === undefined) {
        return res.status(400).json({'message': "Name, capacity, startDate and endDate fields are required in the request body."});
    } 
    else {
        let startDate = new Date(req.body.startDate*1000);
        let endDate = new Date(req.body.endDate*1000);
        if (isNaN(Number(req.body.capacity)) || Number(req.body.capacity) < 0) {
            return res.status(400).json({'message': "Capacity has to be a positive number."});
        } 
        else if (isNaN(Number(req.body.startDate)) || isNaN(Number(req.body.endDate))) {
            return res.status(400).json({'message': "startDate and endDate have to be numbers."});
        }
        else if (currentDate > startDate) {
            return res.status(400).json({'message': "startDate has to be in the future."});
        }
        else if (startDate > endDate) {
            return res.status(400).json({'message': "endDate has to be later than startDate."});
        }
        else {
            // finally do something
            if (req.body.description === undefined && req.body.location === undefined) {
                var newEvent = {id: nextEventId, name: req.body.name, description: "", location: "",capacity: req.body.capacity, 
                startDate: startDate, endDate: endDate, bookings: []}
            }
            else if (req.body.location === undefined) {
                var newEvent = {id: nextEventId, name: req.body.name, description: req.body.description, location: "",capacity: req.body.capacity, 
                startDate: startDate, endDate: endDate, bookings: []}            
            }
            else if (req.body.description === undefined) {
                var newEvent = {id: nextEventId, name: req.body.name, description: "", location: req.body.location, capacity: req.body.capacity, 
                startDate: startDate, endDate: endDate, bookings: []}            
            }
            else {
                var newEvent = {id: nextEventId, name: req.body.name, description: req.body.description, location: req.body.location ,capacity: req.body.capacity, 
                startDate: startDate, endDate: endDate, bookings: []}            
            }
            events.push(newEvent);
            nextEventId++;
            return res.status(201).json(newEvent);
        }
    }
});

app.delete('/api/v1/events/', (req,res) => {
    var returnArray = events.slice();
    events = [];
    return res.status(200).json(returnArray);
});

app.delete('/api/v1/events/:eventId', (req,res) => {
    for (let i = 0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            if (events[i].bookings.length >= 1) {
                return res.status(400).json({'message': "Event with id " + req.params.eventId + " can't be deleted, it has bookings."});
            }
            else {
                return res.status(200).json(events.splice(i,1));
            }
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " does not exist."});
});

app.put('/api/v1/events/:eventId', (req,res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.capacity === undefined || req.body.startDate === undefined || req.body.endDate === undefined) {
        return res.status(400).json({'message': "Name, capacity, startDate and endDate fields are required in the request body."});
    }
    else {
        let currentDate = new Date();
        let startDate = new Date(req.body.startDate*1000);
        let endDate = new Date(req.body.endDate*1000);
        if (isNaN(Number(req.body.capacity)) || Number(req.body.capacity) < 0) {
            return res.status(400).json({'message': "Capacity has to be a positive number."});
        } 
        else if (isNaN(Number(req.body.startDate)) || isNaN(Number(req.body.endDate))) {
            return res.status(400).json({'message': "startDate and endDate have to be numbers."});
        }
        else if (currentDate > startDate) {
            return res.status(400).json({'message': "startDate has to be in the future."});
        }
        else if (startDate > endDate) {
            return res.status(400).json({'message': "endDate has to be later than startDate."});
        }
        else {
            // finally do something
            for (let i=0; i < events.length; i++) {
                if (events[i].id == req.params.eventId) {
                    if (events[i].bookings.length >= 1) {
                        return res.status(400).json({'message': "Event with id " + req.params.eventId + " can't be updated, it has bookings."});
                    }
                    else {
                        events[i].name = req.body.name;
                        events[i].description = req.body.description;
                        events[i].location = req.body.location;
                        events[i].capacity = req.body.capacity;
                        events[i].startDate = startDate;
                        events[i].endDate = endDate;
                        return res.status(200).json(events[i]);
                    }
                }   
            }
            return res.status(404).json({'message': "Event with id " + req.params.eventId + " does not exist."});
        }
    }
});

app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});


app.use('*', (req, res) => {
    res.status(405).send('Operation not supported.');
});