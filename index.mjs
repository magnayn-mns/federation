import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose,RemoteGraphQLDataSource }  from '@apollo/gateway';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {

  async willSendRequest({  request, context }) {
    console.log("FOO");
   // console.log("response" + JSON.stringify(response));        
    console.log("request" + JSON.stringify(request)); 
    console.log("context" + JSON.stringify(context)); 

    request.http.headers.set('x-whammo',"pike");

    if( context.serverRequest != null ) {
        const auth = context.serverRequest.authorization
        
        console.log(auth); 
        console.log( JSON.stringify( request ) );
        console.log("Headers before:")
        console.log( JSON.stringify( request.http.headers ));
        request.http.headers.set('x-fish',"turbot");
        console.log('.');
        request.http.headers.set('Authorization',auth);
        
        

        console.log("Headers after:")
        console.log( JSON.stringify( request.http.headers ));
        
        console.log("----------------");
        console.log( JSON.stringify( request ) );
        console.log("================");
    }
  }

}

const gateway = new ApolloGateway({
    buildService({name, url}) {
        return new AuthenticatedDataSource({url});
    },


    supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
       { name: 'price', url: 'https://dev.nonprod.price.api.mnscorp.net/graphql' },  
       { name: 'customerorder', url: 'https://pr-441-211884f4.azurewebsites.net/graphql'}
     // { name: 'customerorder', url: 'https://dev.nonprod.customerorder.api.mnscorp.net/graphql' },
   //     {name:'customerorder', url:'https://pr-439-211884f4.azurewebsites.net/graphql'},
     //   {name:'price', url:'https://pr-202-ddbf062c.azurewebsites.net/graphql'}
      //   { name: 'price', url: 'http://localhost:8081/graphql' },      
    ],
    
    introspectionHeaders: {
     Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjE5NzA0MzAyNjQ1MzYwMjc5MDgyMjE2MTk4MDQ1Nzg0NTM0NTg4OSIsInR5cCI6IkpXVCJ9.eyJhY3IiOiI1MCIsImFpZCI6ImRlZmF1bHQiLCJhbXIiOlsicHdkIl0sImF1ZCI6WyIzNDAzOGIzMjQwZDI0MjNmYTYzYjBiNWY2Yjg1NDFjYiIsInNwaWZmZTovL2Rldi1tYXJrc2FuZHNwZW5jZXIuZXUuYXV0aHouY2xvdWRlbnRpdHkuaW8vZGV2LW1hcmtzYW5kc3BlbmNlci9kZWZhdWx0L2M2MXY1OGw5NTg1YW01ODAwYWgwIl0sImNpZCI6IjM0MDM4YjMyNDBkMjQyM2ZhNjNiMGI1ZjZiODU0MWNiIiwiY29udGV4dGFiYyI6IjM0MDM4YjMyNDBkMjQyM2ZhNjNiMGI1ZjZiODU0MWNiIiwiZXhwIjoxNjcwODQ4MTk1LCJleHRlbmRlZF9ieV9zY3JpcHQiOiJ5ZXMiLCJpYXQiOjE2NzA4NDQ1OTUsImlkcCI6ImM2MXY4NDlncGdpa2xqcDlkYXZnIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLWRldi5jaWFtLm1hcmtzYW5kc3BlbmNlci5jb20vZGVmYXVsdCIsImp0aSI6ImE2NGU3Y2RiLThlMDctNGE4NS04YTA5LWViNWNmZTFiNmMyMiIsIm5iZiI6MTY3MDg0NDU5NSwicmVxdWVzdGVkX2FjciI6IjUwIiwic2NwIjpbIm9mZmxpbmVfYWNjZXNzIiwib3BlbmlkIiwic3RvcmUubWFya3NhbmRzcGVuY2VyIl0sInN0IjoicHVibGljIiwic3RvcmUiOiJVS19ESUdJVEFMIiwic3ViIjoiNTA0NDIxOTcxIiwidGlkIjoiZGV2LW1hcmtzYW5kc3BlbmNlciIsIndjX3Rva2VuIjoiMjU3MjM4NzMlMkNhVlZNYnolMkJwdUVYNmpxQUslMkZKNUJpWktlJTJGJTJCZURzNEhFRldUYTRtbkZpdjRSY2w5bFNjaFc3cSUyQlJOT0tDTEppR3lpQiUyRnl6V0kwNzlwWW5MRzFwOVhCSnprUkVLN2VxYjlCUyUyRjRjaGhpU0xYTmFub1ZYaVJsRCUyRmk3ajI1b2FmUWYlMkJPWW9kdzIzcmttRXpNejByem5PJTJCRzFGNmIwRWNMRHlZJTJGUE50cHp1RlpOdjBNUk9ZRUg0NHRSM0RuYkhRNjNQWTZYYVphJTJCQUJsWSUyQkhGOWh6ajd3YSUyQlFSc3dpcDhxMTVVWGhwRjR6bTdWbXJLOG84YUxxJTJGJTJCTkxiZzgybnR4MUFjOG9GT3pVRmphN2NlMU9FZkFqJTJCMWclM0QlM0QiLCJ3Y190cnVzdGVkX3Rva2VuIjoiMjU3MjM4NzMlMkN0dE1iUm1EMUtieHNKSDZYbXBoRlczRTFkSGtEenN3TmVqdU9MTFUwZnI0JTNEIn0.84fUEmGbo9XOtztnNzRQN52kAPd0Xr4WgUo1EyAn5w47Md4RXG2N5JbIAKdERiMzmyVcjb3mejd9D3wpXo-qDQ'
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
