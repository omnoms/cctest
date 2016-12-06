exports.creds = { 
  returnURL: 'https://ccmvwebapp.azurewebsites.net/auth/openid/return', 
  identityMetadata: 'https://login.microsoftonline.com/6be76997-78c9-44ad-8ccc-949dcc44ba4b/.well-known/openid-configuration', 
  clientID: '7eaf21e4-242c-4422-9d4e-c464ce509711', 
  skipUserProfile: true, 
  responseType: 'id_token', 
  responseMode: 'form_post' 
 };

  exports.db = {
    userName: 'ccmvuser',  
    password: '123123!PW',  
    server: 'itappdev.database.windows.net',  
    // If you are on Microsoft Azure, you need this:  
    options: {encrypt: true, database: 'cc_mv_l3_db'}
 };