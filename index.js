import fetch from 'node-fetch';
import { Telegraf } from 'telegraf';
import { WebSocketServer } from 'ws';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
let COINBALANCE = 0;

const ws = new WebSocketServer({ port: 8080 });
const app = express(); 
const bot = new Telegraf(process.env.BOT_TOKEN);

const GRAPHQL_ENDPOINT = 'https://bot-backend-c5u1.onrender.com/graphql';

const connections = new Map();

ws.on('connection', (ws) => {
  console.log('Frontend connected to WebSocket');
  
  const clientId = Math.random().toString(36).substring(2);
  connections.set(clientId, ws);
  
  ws.on('close', () => {
    connections.delete(clientId);
  });
});

bot.telegram.setWebhook(`${process.env.DOMAIN}/telegram`);
app.use(bot.webhookCallback('/telegram'));

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
              username
              coin_balance
            }
          }
        `,
      }),
    });

    const data = await response.json();
    console.log('data',data)
    COINBALANCE = data.data.user.coin_balance;
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
Start earning coins now by tapping on the robot and watch your balance grow.

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



    // ctx.reply(`Welcome to the TapMe game, ${username}!. You coin balance is ${COINBALANCE}`);
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
    ctx.reply(`Your current coin balance is ${data.data.user.coin_balance}.`);
  } else {
    ctx.reply('User not found.');
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

// bot.launch().then(() => {
//   console.log('Bot is running...');
// }).catch((error) => {
//   console.error('Error launching bot:', error);
// });

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
