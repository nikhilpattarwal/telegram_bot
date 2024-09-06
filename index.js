import fetch from 'node-fetch';
import { Telegraf } from 'telegraf';
import { WebSocketServer } from 'ws';

const ws = new WebSocketServer({ port: 8080 });

const connections = new Map(); // To keeping track of connected clients

ws.on('connection', (ws) => {
  console.log('Frontend connected to WebSocket');
  
  const clientId = Math.random().toString(36).substring(2);
  connections.set(clientId, ws);
  
  ws.on('close', () => {
    connections.delete(clientId);
  });
});

const bot = new Telegraf('7356242587:AAE0psXiodkVUcdgYi6HboAjKurFNUscEAM');

const GRAPHQL_ENDPOINT = 'https://bot-backend-c5u1.onrender.com/graphql';

bot.start(async (ctx) => {
  const userId = ctx.from.id.toString(); 
  const username = ctx.from.username;
  console.log(userId, username);
  try {
    let response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            user(id: "${userId}") {
              id
            }
          }
        `,
      }),
    });

    const data = await response.json();
    console.log('data',data);

    if (!data.data.user) {
      response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation {
              createUser(id: "${userId}", username: "${username}", coin_balance: 0) {
                id
                username
                coin_balance
              }
            }
          `,
        }),
      });

      const creationData = await response.json();

      if (creationData.errors) {
        throw new Error(`GraphQL error: ${creationData.errors[0].message}`);
      }
    }

    // }
    const tempUrl ='https://nikhil-pattarwal-coinbase.netlify.app/';

    const welcomeMessage = `Hey there, @${username}! Welcome to the coinrobot experience!
Start earning coins now by tapping on the coin and watch your balance grow.

coinrobot is an innovative platform designed to reward users through our mining features. Most of the coinrobot coins (CC) will be distributed among our active players.

Got friends, family, or colleagues?
Invite them to join the fun—more people, more tokens!`;
    

       const inlineKeyboard = [
        [
          {
            text: 'Start Now',
            web_app: {
              url: tempUrl
            }
          }
        ]
      ];

  ctx.reply(welcomeMessage, {
    reply_markup: {
      inline_keyboard: inlineKeyboard 
    }
  });



    ctx.reply(`Welcome to the TapMe game, ${username}! Your current coin balance is ${0}.`);
    connections.forEach((ws) => {
      ws.send(JSON.stringify({ id: userId, username }));
    });
  } catch (error) {
    console.error('Error in /start command:', error);
    ctx.reply('An error occurred while processing your request. Please try again later.');
  }
});



bot.command('balance', async (ctx) => {
  const userId = ctx.from.id;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          user(id: "${userId}") {
            id
            username
            coin_balance
          }
        }
      `,
    }),
  });
  const data = await response.json();

  if (data.data.user) {
    ctx.reply(`Your current coin balance is ${0}.`);
  } else {
    ctx.reply('User not found.');
  }
});

bot.command('tap', async (ctx) => {
  const userId = ctx.from.id;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          user(id: "${userId}") {
            id
            coin_balance
          }
        }
      `,
    }),
  });
  const data = await response.json();
  console.log('data',data);
  if (data.data.user) {
    const updatedResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            updateUserCoins(id: "${userId}", coins: ${1}) {
              id
              coin_balance
            }
          }
        `,
      }),
    });
    const updatedData = await updatedResponse.json();

    ctx.reply(`You have tapped! Your new coin balance is ${0}.`);
  } else {
    ctx.reply('User not found.');
  }
});

bot.launch().then(() => {
  console.log('Bot is running...');
}).catch((error) => {
  console.error('Error launching bot:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
