export const environment = {
  production: false,
  version: '0.0.0',

  imageUrl: 'https://stagingapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://stagingapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://stagingapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  apiUrl: 'https://stagingapi.wellyx.com/api/Core/',
  stripeRedirectUrl: "https://stagingcore.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://stagingweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://stagingenterprise.wellyx.com/account/login?ID=',
  ENVName: 'staging'
};
