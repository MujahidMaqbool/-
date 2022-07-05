export const environment = {
  production: true,
  version: '0.0.0',

  imageUrl: 'https://dooraccessapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://dooraccessapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://dooraccessapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  apiUrl: 'https://dooraccessapi.wellyx.com/api/Core/',
  stripeRedirectUrl: "https://dooraccesscore.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://dooraccessweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://dooraccessenterprise.wellyx.com/account/login?ID=',
  ENVName: 'dooraccess'
};
