exports.creds = {
  returnURL: 'https://localhost:3000/auth/openid/return', 
  identityMetadata: 'https://login.microsoftonline.com/65f51067-7d65-4aa9-b996-4cc43a0d7111/.well-known/openid-configuration', 
  clientID: '7eaf21e4-242c-4422-9d4e-c464ce509711', 
  skipUserProfile: true, 
  responseType: 'id_token', 
  responseMode: 'form_post' 
};

exports.db = { 
  userName: 'ccmvuser',  
  password: '123123!PW',
  server: 'itappdev.database.windows.net', 
  options: {encrypt: true, database: 'cc_mv_l3_db'}
};