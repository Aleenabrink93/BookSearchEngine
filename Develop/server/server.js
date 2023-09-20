const express = require('express');
const path = require('path');
// import ApolloServer
const {ApolloServer} = require ('apollo-server-express');

// import typeDefs and resolvers
const {typeDefs, resolvers} = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({typeDefs, resolvers, context:authMiddleware});

server.applyMiddleware({app});

app.use(express.urlencoded({ extended: false }));

app.use(express.json());


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`GraphQL is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
