import React, { useState } from 'react';
import 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { Container, CssBaseline, Link, Box, Typography, MenuItem, InputLabel, Button, Select, FormControl, TextField } from '@material-ui/core';
import MultiSelect from "react-multi-select-component";
const axios = require('axios').default;
axios.defaults.baseURL = 'http://localhost:9999';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let ccList = [
  "ACE The Place CC",
  "Anchorvale CC",
  "Ayer Rajah CC",
  "Bedok CC",
  "Boon Lay CC",
  "Braddell Heights CC",
  "Bukit Batok CC",
  "Bukit Merah CC",
  "Bukit Panjang CC",
  "Bukit Timah CC",
  "Buona Vista CC",
  "Cairnhill CC",
  "Canberra CC",
  "Changi Simei CC",
  "Chong Pang CC",
  "Chua Chu Kang CC",
  "Clementi CC",
  "Eunos CC",
  "Gek Poh Ville CC",
  "Geylang Serai CC",
  "Geylang West CC",
  "Henderson CC",
  "Hong Kah North CC",
  "Hougang CC",
  "Jalan Besar CC",
  "Joo Chiat CC",
  "Jurong Green CC",
  "Jurong Spring CC",
  "Kaki Bukit CC",
  "Kallang CC",
  "Kampong Kembangan CC",
  "Kampong Ubi CC",
  "Keat Hong CC",
  "Kebun Baru CC",
  "Kim Seng CC",
  "Leng Kee CC",
  "MacPherson CC",
  "Marine Parade CC",
  "Nanyang CC",
  "Nee Soon East CC",
  "Nee Soon South CC",
  "OUR TAMPINES HUB CC",
  "Pasir Ris Elias CC",
  "Paya Lebar Kovan CC",
  "Pek Kio CC",
  "Potong Pasir CC",
  "Punggol 21 CC",
  "Queenstown CC",
  "Radin Mas CC",
  "Sembawang CC",
  "SENJA - CASHEW CC FACILITIES",
  "Siglap CC",
  "Taman Jurong CC",
  "Tampines Changkat CC",
  "Tampines North CC",
  "Tampines West CC",
  "Tanglin CC",
  "Tanjong Pagar CC",
  "Teck Ghee CC",
  "Telok Blangah CC",
  "The Frontier CC",
  "Tiong Bahru CC",
  "Toa Payoh East CC",
  "Toa Payoh South CC",
  "Toa Payoh West CC",
  "West Coast CC",
  "Whampoa CC",
  "Woodlands CC",
  "Woodlands Galaxy CC",
  "Yew Tee CC",
  "Yio Chu Kang CC",
  "Yuhua CC",
  "Zhenghua CC"
]

const slotList = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 }
];


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/Daneaz/BadmintonBooker">
        Eugene Wu
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemMargin: {
    marginTop: theme.spacing(1),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(5),
  },
  multiSelect: {
    marginTop: theme.spacing(3),
  }
}));

export default function BadmintonBooker() {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [location, setLocation] = React.useState('Whampoa CC');
  const [email, setEmail] = React.useState('eugeneaad@gmail.com');
  const [selectedSlots, setSelectedSlots] = useState([
    { label: "6", value: 6 },
    { label: "7", value: 7 },
    { label: "8", value: 8 },]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    let slots = selectedSlots.map(slot => {
      return slot.value
    })
    axios.post('/book', {
      date: selectedDate,
      location: location,
      slot: slots,
      email: email
    }).then((response) => {
      alert(response.data);
    }).catch((error) => {
      alert(error);
    });
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Badminton Booker
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField className={classes.itemMargin} fullWidth label="Email:" defaultValue="eugeneaad@gmail.com" onChange={handleEmailChange} />
          <MuiPickersUtilsProvider className={classes.itemMargin} utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date:"
              value={selectedDate}
              autoOk
              fullWidth
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
            />
          </MuiPickersUtilsProvider>
          <FormControl className={classes.itemMargin} fullWidth>
            <InputLabel>Location:</InputLabel>
            <Select
              value={location}
              onChange={handleLocationChange}
            >
              {
                ccList.map((cc, i) => {
                  return <MenuItem key={i} value={cc}>{cc}</MenuItem>
                })
              }
            </Select>
          </FormControl>
          <MultiSelect
            className={classes.multiSelect}
            options={slotList}
            value={selectedSlots}
            onChange={setSelectedSlots}
            labelledBy={"Select Slots"}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Book
          </Button>
        </form>
      </div>

      <Box mt={8}>
        <Copyright />
      </Box>
    </Container >
  );
}