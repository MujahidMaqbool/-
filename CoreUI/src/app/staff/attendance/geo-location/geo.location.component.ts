// #region Imports

/**Angular Modules */
import { Component, Inject, OnInit } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Models */
import { StaffGeoLocation ,LatitudeLongitude} from 'src/app/staff/models/attendance.timesheet.model'

/** Configurations **/
import { ENU_CheckIn_Out_Type } from 'src/app/helper/config/app.enums';

@Component({
  selector: 'app-geo-location',
  templateUrl: './geo.location.component.html',
})
// #endregion

export class GeoLocationComponent implements OnInit {

    /** Local Variables */
  zoom = 12
  centerClockIn: google.maps.LatLngLiteral
  centerClockOut: google.maps.LatLngLiteral
  Latitude:{}

  /**  Collections **/
  StaffLocation: StaffGeoLocation = new StaffGeoLocation();
  LatitudeLongitude: LatitudeLongitude = new LatitudeLongitude();
  markerclockIn = []
  markerClockOut = []

  /** Configurations**/
  checkIn_Out = ENU_CheckIn_Out_Type


    /** Constructor */
  constructor(
    private dialogRef: MatDialogRef<GeoLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public Model: any
  ) { }

    /***********Angular Events *********/

  ngOnInit() {
    this.StaffLocation = this.Model.timesheetObj;
    this.addMarkerClockIn({Latitude:this.StaffLocation.ClockInLat,Longitude:this.StaffLocation.ClockInLong});
    this.addMarkerClockOut({Latitude:this.StaffLocation.ClockOutLat,Longitude:this.StaffLocation.ClockOutLong});
  }

      // #region Events

  //set the marker on map for clockIn and also sets the map center
  addMarkerClockIn(LatitudeLongitude:LatitudeLongitude) {
    if(LatitudeLongitude){
    this.centerClockIn = {
      lat:LatitudeLongitude.Latitude,
      lng:LatitudeLongitude.Longitude 
    }
    this.markerclockIn.push({
      position: {
        lat:LatitudeLongitude.Latitude,
        lng:LatitudeLongitude.Longitude 
      },
    })
  }
  }

  //set the marker on map for clockOut and also sets the map center
  addMarkerClockOut(LatitudeLongitude:LatitudeLongitude) {
    if(LatitudeLongitude){
    this.centerClockOut = {
      lat:LatitudeLongitude.Latitude,
      lng:LatitudeLongitude.Longitude 
    }
    this.markerClockOut.push({
      position: {
      lat:LatitudeLongitude.Latitude,
      lng:LatitudeLongitude.Longitude    
      },
    })
  }
  }
  onClose() {
    this.closePopup();
  }
  closePopup(): void {
    this.dialogRef.close();
  }
      // #endregion

}
