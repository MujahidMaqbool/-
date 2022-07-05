// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: '0.0.0',

  imageUrl: 'https://preliveapi.wellyx.com/UploadDownload/Images/cp{ImagePath}/',
  qrCodeUrl: 'https://preliveapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://preliveapi.wellyx.com/UploadDownload/Documents/cp{ImagePath}/',
  apiUrl: 'https://preliveapi.wellyx.com/api/Core/',


  stripeRedirectUrl: "https://prelivecore.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://preliveweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://preliveenterprise.wellyx.com/account/login?ID=',
  ENVName: 'prelive'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


