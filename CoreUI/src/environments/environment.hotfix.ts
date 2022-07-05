export const environment = {
  production: true,
  version: '0.0.0',

  imageUrl: 'https://hotfixapi.wellyx.com/UploadDownload/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://hotfixapi.wellyx.com/UploadDownload/QRCode/',
  fileUrl: 'https://hotfixapi.wellyx.com/UploadDownload/Documents/CP{ImagePath}/',
  apiUrl: 'https://hotfixapi.wellyx.com/api/Core/',
  stripeRedirectUrl: "https://hotfixapi.wellyx.com/setup/configurations/payments",
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://hotfixweb.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect-sandbox.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://hotfixenterprise.wellyx.com/account/login?ID=',
  ENVName: 'hotfix'
};
