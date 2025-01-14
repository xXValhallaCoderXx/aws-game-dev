import { type ClientSchema, a, defineData } from '@aws-amplify/backend';


const schema = a.schema({
  Item: a.model({
    itemId: a.string().required(),
    quantity: a.integer().required(),
    // 1. Create a reference field
    playerId: a.id(),
    // 2. Create a belongsTo relationship with the reference field
    player: a.belongsTo('Player', 'playerId'),
  }),
  Quest: a.model({
    questId: a.string().required(),
    collected: a.integer(),
    isCompleted: a.boolean().required(),
    // 1. Create a reference field
    playerId: a.id(),
    // 2. Create a belongsTo relationship with the reference field
    player: a.belongsTo('Player', 'playerId'),
  }),

  Player: a.model({
    userId: a.string().required(),

    gold: a.integer(),
    stats: a.customType({
      strength: a.integer(),
      health: a.integer(),
      maxHealth: a.integer(),
      defense: a.integer(),
      speed: a.integer(),
      level: a.integer()
    }),
    quests: a.hasMany("Quest", "playerId"),
    items: a.hasMany('Item', 'playerId'),
  }),
}).authorization((allow) => allow.publicApiKey());



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
