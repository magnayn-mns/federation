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
    // { name: 'price', url: 'https://dev.nonprod.price.api.mnscorp.net/graphql' },
     {name:'price', url:'https://pr-817-ddbf062c.azurewebsites.net/graphql'},
     { name: 'customerorder', url: 'https://dev.nonprod.customerorder.api.mnscorp.net/graphql' },
     { name: 'product', url: 'https://dev.nonprod.product.api.mnscorp.net/graphql' },
    
    
    // { name: 'price-enquiry', url: 'https://pr-48-6d378afa.azurewebsites.net/graphql' }
    { name: 'price-enquiry', url: 'http://localhost:8080/graphql'}


     //  { name: 'customerorder', url: 'https://pr-441-211884f4.azurewebsites.net/graphql'}
   

  // { name: 'customerorder', url: 'http://localhost:8100/graphql' }

   //     {name:'customerorder', url:'https://pr-439-211884f4.azurewebsites.net/graphql'},
     //   {name:'price', url:'https://pr-202-ddbf062c.azurewebsites.net/graphql'}
      //   { name: 'price', url: 'http://localhost:8081/graphql' },      


     //    { name: 'l1', url: 'http://localhost:4000/graphql' },
     //   { name: 'l2', url: 'http://localhost:4001/graphql' },
       
    ],
    
    introspectionHeaders: {
     Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjE5NzA0MzAyNjQ1MzYwMjc5MDgyMjE2MTk4MDQ1Nzg0NTM0NTg4OSIsInR5cCI6IkpXVCJ9.eyJhY3IiOiI1MCIsImFpZCI6ImRlZmF1bHQiLCJhbXIiOlsicHdkIl0sImF1ZCI6WyIzNDAzOGIzMjQwZDI0MjNmYTYzYjBiNWY2Yjg1NDFjYiIsInNwaWZmZTovL2F1dGgtZGV2LmNpYW0ubWFya3NhbmRzcGVuY2VyLmNvbS9kZWZhdWx0L2M2dTk1NjN2ZWR2NmVsZWlvZnRnIiwic3BpZmZlOi8vZGV2LW1hcmtzYW5kc3BlbmNlci5ldS5hdXRoei5jbG91ZGVudGl0eS5pby9kZXYtbWFya3NhbmRzcGVuY2VyL2RlZmF1bHQvYzYxdjU4bDk1ODVhbTU4MDBhaDAiXSwiYXV0aF90aW1lIjoxNzAzMDg4MDQyLCJjaWQiOiIzNDAzOGIzMjQwZDI0MjNmYTYzYjBiNWY2Yjg1NDFjYiIsImV4cCI6MTcwMzA4OTU0NSwiaWF0IjoxNzAzMDg4MDQ0LCJpZHAiOiJjNjF2ODQ5Z3BnaWtsanA5ZGF2ZyIsImlzcyI6Imh0dHBzOi8vYXV0aC1kZXYuY2lhbS5tYXJrc2FuZHNwZW5jZXIuY29tL2RlZmF1bHQiLCJqdGkiOiI3NTVjZTE4Mi04NjZmLTRkNWQtYThmNS1hNGVkZDQzYjY2ZTQiLCJuYmYiOjE3MDMwODgwNDQsInJlcXVlc3RlZF9hY3IiOiI1MCIsInNjcCI6WyJtYW5kcyIsIm9mZmxpbmVfYWNjZXNzIiwib3BlbmlkIiwic3RvcmUubWFya3NhbmRzcGVuY2VyIl0sInN0IjoicHVibGljIiwic3RvcmUiOiJVS19ESUdJVEFMIiwic3ViIjoiNTA0NDIxOTcxIiwidGlkIjoiZGV2LW1hcmtzYW5kc3BlbmNlciIsIndjX3Rva2VuIjoiMjU3MjM4NzMlMkNGR0xMTTV2JTJGMk1LQ1RrS3R4bHRHbWRlUU5mVG9lcHBqeXIwdG5zRHdlenBmOHJ4OHduTFJ5MnBzT080TmRRcHk5SHZuJTJGUXZhWnVXazJsb2pVQXZlU1dvc3dQSUdYeVNOMmpCRXVQNXlqdVB5MjRkTmt6RTJ3Q1hGWDlHaCUyQk9lZTI5JTJGVFBMRm5Db2VJcFpqdHhKQmV3YkV4dXNOWE4wbmpJVFZ1R1AzaEl3UmdBN0xMQkgzSzNkeUNVQUlFZGxoa0IxSUdOaGFnajcyb1JkVXFGJTJGd1ZWSjhza3VNV2cyTDBqVFNSUGJoeGFEdXhSdHpJdkxFcDFvUHRmaWdYdFprRnhaYXpGR0NMT3pmRHFLVjZlMGRHMkElM0QlM0QiLCJ3Y190cnVzdGVkX3Rva2VuIjoiMjU3MjM4NzMlMkNrbFolMkYyUUJTOTlJZU1kTSUyQkRFbVg4NUxYJTJCdiUyQnNMQzRlbmNoTWQ3N3kxN0klM0QifQ.sMJ-CNd7TRs3vBSU-JGn2Z_00FTAbTZzitpDV8hXqDEWXPb-H14QXynqfSPAoRt3Zlk6Pf_0O50-hRug5girzg'
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
        listen: { port: 5001 },
        context: async({req,res} ) => ({ 
                serverRequest: req.headers
        })
    });
console.log(`🚀 Server ready at ${url}`);
