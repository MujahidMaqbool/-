// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  version: '0.0.0',
  imageUrl: 'https://sandboxapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://sandboxapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://sandboxapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  apiUrl: 'https://stagingapi.wellyx.com/api/Core/',
  stripeRedirectUrl: "https://sandboxcore.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://sandboxweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://sandboxenterprise.wellyx.com/account/login?ID=',
  ENVName: 'sandbox'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
