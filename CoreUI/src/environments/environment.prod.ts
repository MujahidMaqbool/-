export const environment = {
  production: true,
  version: '0.0.313',
  imageUrl: 'https://fileswellyxproductioneu.s3.eu-west-2.amazonaws.com/Images/CP{ImagePath}/',
  qrCodeUrl: 'https://fileswellyxproductioneu.s3.eu-west-2.amazonaws.com/QRCode/',
  apiUrl: 'https://api.wellyx.com/api/Core/',
  fileUrl: 'https://fileswellyxproductioneu.s3.eu-west-2.amazonaws.com/Documents/CP{ImagePath}/',
  stripeRedirectUrl: 'https://core.wellyx.com/setup/configurations/payments',
  stripeConnectUrl: 'https://connect.stripe.com',
  formUrl: 'https://web.wellyx.com/{CompanyID}/{BranchID}/{SourceType}/{FormID}/{CustomerFormID}',
  goCardlessConnectUrl: 'https://connect.gocardless.com',
  tinyUrl: 'https://tinyurl.com/api-create.php?url=',
  enterPriseUrl:'https://enterprise.wellyx.com/account/login?ID=',
  ENVName: 'live'
};
