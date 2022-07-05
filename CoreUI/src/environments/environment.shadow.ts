export const environment = {
  production: false,
  version: '0.0.0',
  imageUrl: 'https://shadowapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://shadowapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://shadowapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  apiUrl: 'https://shadowapi.wellyx.com/api/Core/',
  stripeRedirectUrl: "https://shadowapi.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://shadowweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://shadowenterprise.wellyx.com/account/login?ID=',
  ENVName: 'shadow'
};
