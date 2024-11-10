const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  throw new Error('Missing TELEGRAM_TOKEN environment variable');
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// /start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendPhoto(chatId, 'https://chillape-bnb.vercel.app/banner.png', { // Replace with actual image URL
    caption: `Welcome to ChillApe - the next generation of user-friendly Dapp invested by Binance Labs.(We're manifesting 😉)`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Menu', callback_data: 'menu' },
          { text: '🎮 Community', callback_data: 'community' },
        ],
        [
          { text: '💬 Support', callback_data: 'support' }
        ]
      ]
    }
  });
});

// Handle Menu button callback
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  switch (query.data) {
    case 'community':
      bot.sendMessage(chatId, 'Exciting community engagement tasks coming soon');
      break;
    case 'support':
      bot.sendMessage(chatId, 'Grab the developers making the presentation, they are tech support');
      break;
    case 'menu':
      bot.sendMessage(chatId, `*Menu:*`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🤖 Start ChillApe Bot', callback_data: 'start_chillape' }
            ],
            [
              { text: '⛽ Buy Gas on BNB (Coming Soon)', callback_data: 'buy_gas' }
            ],
            [
              { text: '🌉 Nitro Bridge (Coming Soon)', callback_data: 'nitro_bridge' }
            ],
            [
              { text: '🖼️ NFT Marketplace (Coming Soon)', callback_data: 'nft_marketplace' }
            ]
          ]
        }
      });
      break;
    case 'start_chillape':
      bot.sendMessage(chatId, `Thena Mini App: Add liquidity on Thena from any chain with no sign-ins.`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Open Thena Mini App', url: "https://t.me/chillape_bnb_bot/app" }
            ]
          ]
        }
      });
      break;
    case 'buy_gas':
      bot.sendMessage(chatId, 'Coming soon... User can buy BNB gas from any chain if they want.');
      break;
    case 'nitro_bridge':
      bot.sendMessage(chatId, 'Coming soon... User can do cross-chain bridging using multiple bridges in the market, finding the best suitable path.');
      break;
    case 'nft_marketplace':
      bot.sendMessage(chatId, 'Coming soon... Chain-agnostic way of buying NFTs from any chain on the BNB chain (e.g., PancakeSwap NFT marketplace).');
      break;
    default:
      bot.sendMessage(chatId, 'Invalid selection.');
  }
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content of the message

  const chatId = msg.chat.id;
  const resp = match ? match[1] : ''; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// // Listen for any kind of message. There are different kinds of messages.

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Please select from available menu');
// });


// Error handling for polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.response ? error.response.body : error.message);
});
