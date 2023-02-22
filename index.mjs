import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose,RemoteGraphQLDataSource }  from '@apollo/gateway';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {

  async willSendRequest({  request, context }) {
    console.log("WILL SEND REQUEST " + request.http.url);
    console.log("============================================");
   // console.log("response" + JSON.stringify(response));        
    console.log("Request = " + JSON.stringify(request)); 
    console.log("Context = " + JSON.stringify(context)); 

    request.http.headers.set('x-whammo',"pike");

    if( context.serverRequest != null ) {
        const auth = context.serverRequest.authorization
        

        request.http.headers.set('x-fish',"turbot");
        request.http.headers.set('Authorization',auth);
        
        if( context.cacheData != null ) {
          console.log("*** Yes have cache data ***");
            request.http.headers.set('X-CacheData',context.cacheData);    
        }

        console.log("Headers after:")
        console.log( JSON.stringify( [...request.http.headers] ));
        
    }
  }

  didReceiveResponse({ response, request, context }) {
    
    console.log("PROCESS RESPONSE " + request.http.url);
    console.log("============================================");

    console.log("Headers = " + JSON.stringify([...response.http.headers]))
    
    
    const cache = response.http.headers.get('X-CacheData');
    if (cache) {
      context.cacheData = cache;
    }

    // Testing
    context.cacheData = "Bibble";


    // Return the response, even when unchanged.
    return response;

  }

}

const gateway = new ApolloGateway({
    buildService({name, url}) {
        return new AuthenticatedDataSource({url});
    },


    supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
       { name: 'price', url: 'https://dev.nonprod.price.api.mnscorp.net/graphql' },  
     //  { name: 'customerorder', url: 'https://pr-441-211884f4.azurewebsites.net/graphql'}
      { name: 'customerorder', url: 'https://dev.nonprod.customerorder.api.mnscorp.net/graphql' },
   //     {name:'customerorder', url:'https://pr-439-211884f4.azurewebsites.net/graphql'},
     //   {name:'price', url:'https://pr-202-ddbf062c.azurewebsites.net/graphql'}
      //   { name: 'price', url: 'http://localhost:8081/graphql' },      
    ],
    
    introspectionHeaders: {
     Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjE5NzA0MzAyNjQ1MzYwMjc5MDgyMjE2MTk4MDQ1Nzg0NTM0NTg4OSIsInR5cCI6IkpXVCJ9.eyJhY3IiOiI1MCIsImFpZCI6ImRlZmF1bHQiLCJhbXIiOlsicHdkIl0sImF1ZCI6WyIzNDAzOGIzMjQwZDI0MjNmYTYzYjBiNWY2Yjg1NDFjYiIsInNwaWZmZTovL2Rldi1tYXJrc2FuZHNwZW5jZXIuZXUuYXV0aHouY2xvdWRlbnRpdHkuaW8vZGV2LW1hcmtzYW5kc3BlbmNlci9kZWZhdWx0L2M2MXY1OGw5NTg1YW01ODAwYWgwIl0sImNpZCI6IjM0MDM4YjMyNDBkMjQyM2ZhNjNiMGI1ZjZiODU0MWNiIiwiZXhwIjoxNjc3MDY2MjEzLCJpYXQiOjE2NzcwNjQ3MTIsImlkcCI6ImM2MXY4NDlncGdpa2xqcDlkYXZnIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLWRldi5jaWFtLm1hcmtzYW5kc3BlbmNlci5jb20vZGVmYXVsdCIsImp0aSI6ImZhNDgzNzA2LWEyNjMtNDI2MS1iMGY2LWUyNWE1MGFkOTc5OSIsIm5iZiI6MTY3NzA2NDcxMiwicmVxdWVzdGVkX2FjciI6IjUwIiwic2NwIjpbIm9mZmxpbmVfYWNjZXNzIiwib3BlbmlkIiwic3RvcmUubWFya3NhbmRzcGVuY2VyIl0sInN0IjoicHVibGljIiwic3RvcmUiOiJVS19ESUdJVEFMIiwic3ViIjoiNTA0NDIxOTcxIiwidGlkIjoiZGV2LW1hcmtzYW5kc3BlbmNlciIsIndjX3Rva2VuIjoiMjU3MjM4NzMlMkN2SWZiOWdQWWpQakpaJTJCb2hwdVk4V3JQQjZJRFFXaVgwM0t4T0pkT201S1VhMkpnTVRscWxEeGFKa3ZrTTBKb3IwNGdQY3FyUld0TWc1OUFrVkJGNVJVYjNDNnFKN1dabCUyQlJFTnZRVU5qb1RnWE5WJTJGZiUyRlpXY3NnZ1pHRnV1WWJzUHY4TWJXJTJCVllpJTJGWk5JcTVjZmZsemxnc3I4SXFmWk44TG54RlFwYW5pM01weFFoY3kwJTJCNWVNVkU5dTVjZ0JTNEIlMkJvQ29FZjFhTERaYXBFeGY1RDBoeEdydHRWa0g2NDdJN1MxTmV0aWNPbW56JTJGbjh3UVcxVEFXNzJ3SFBoclN6OUJGYUtoNmp5am9kWHdIYSUyRngyTzl3JTNEJTNEIiwid2NfdHJ1c3RlZF90b2tlbiI6IjI1NzIzODczJTJDMmpMQnFIR3JDZWl5blpCU0UlMkJnd0gxM2dsZG9qUERhcjhHeElhNXhObXp3JTNEIn0.0j2DvWtOYhTYppcmvEfz0N0k4rVz7mRXabO-XWLV7XRo5wtOV5CFxE31xv1n3Zkd7jhZc_rzSw-Jeou1pW-u0A'
    },
    context: ({ req }) => {
        console.log("Process ");
    //    console.log(req);
        console.log(req.headers);
        
        return {
          serverRequest: req.headers,
    } }

    
  }),
});


const server = new ApolloServer({
    gateway,
    context: ({ req }) => {
        console.log("Process ");
    //    console.log(req);
        console.log(req.headers);
        
    return {
      serverRequest: req.headers,
    };
  },
});


const { url } = await startStandaloneServer(server,
    {
        context: async({req,res} ) => ({ 
                serverRequest: req.headers
        })
    });
console.log(`🚀 Server ready at ${url}`);
