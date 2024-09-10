
## Telegram Bot with WebSocket and GraphQL Integration

## Description
This project is a Telegram bot that connects with a React + TypeScript web app and interacts with a GraphQL backend hosted on Render. The bot uses WebSockets to communicate with the frontend, allowing real-time updates for users. It includes a coin balance system where users can start mining coins by interacting with the bot and the connected web app.

## Features
Start Command (/start): Registers a new user or retrieves an existing user from the GraphQL backend.
Balance Command (/balance): Displays the current coin balance of the user.
Real-time updates: Communicates with the web app via WebSocket to provide live user data.
Web Integration: Launches the web app through an inline keyboard button when the /start command is triggered.
Tech Stack
Node.js: Backend runtime
Express: Web server framework for handling bot webhooks
Telegraf: Telegram bot framework for managing bot commands and interactions
GraphQL: Backend API for managing user data and coin balances
WebSocket: Real-time connection for pushing updates to the frontend
Render.com: Hosting service for the backend
Netlify: Hosting service for the frontend
Dotenv: Environment variable management

## Installation
## Clone the repository:
git clone https://github.com/your-repo-url
cd telegram-bot
npm install

## Create a .env file in the root directory and add the following variables:
BOT_TOKEN=your-telegram-bot-token
DOMAIN=your-backend-domain
PORT=your-port (default: 3001)

## Start Server
npm start


## Webhook Setup
The bot uses webhooks for handling Telegram messages. Make sure to set your webhook correctly:

Dependencies
dotenv: ^16.4.5
express: ^4.19.2
node-fetch: ^2.7.0
telegraf: ^4.16.3
ws: ^8.18.0

Author: Nikhil Pattarwal
Email: nikhilpatterwal123@gmail.com



