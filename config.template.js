 exports.creds = {
 	returnURL: 'https://XXXXX/auth/openid/return', //Configured in the Azure auth portal
 	identityMetadata: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/.well-known/openid-configuration', // Add the tender GUID
 	clientID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', //Application ID from Azure auth portal
 	skipUserProfile: true, // for AzureAD should be set to true.
 	responseType: 'id_token', // for login only flows use id_token. For accessing resources use `id_token code`
 	responseMode: 'form_post' // For login only flows we should have token passed back to us in a POST
 };

  exports.db = {
    userName: 'xxxxx',  
    password: 'xxxxx',  
    server: 'xxxxxxxx',  
    // If you are on Microsoft Azure, you need this:  
    options: {encrypt: true, database: 'xxxxxx'}
 };