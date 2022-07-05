export const environment = {
  production: true,
  version: '0.0.0',

  imageUrl: 'https://qaapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://qaapi.wellyx.com/UploadDownload/QRCode/',
  apiUrl: 'https://qaapi.wellyx.com/api/Core/',
  fileUrl: 'https://qaapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  stripeRedirectUrl: 'https://qacore.wellyx.com/setup/configurations/payments',
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://qaweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://qaenterprise.wellyx.com/account/login?ID=',
  ENVName: 'qa'
};
