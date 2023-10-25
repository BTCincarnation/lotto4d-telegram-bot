const express = require('express');
const expressApp = express();
const path = require("path");
const port = 8443;
expressApp.use(express.static('static'));
expressApp.use(express.json());
require('dotenv').config();
const Web3 = require('web3');
const contractABI = require('./abi.json');
const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create a new connection to the Polygon Chain
const w3 = new Web3(new Web3.providers.HttpProvider('https://polygon-testnet.public.blastapi.io'));

const contractAddress = '0x989c852D2fED95e2A7ef7392ee1223ea5B91b8c2';

// Define the commands that your bot will respond to
bot.start((ctx) => {
    ctx.reply("Welcome to Lotto4DToken Bot! Choose an option:", {
        reply_markup: {
            keyboard: [
        ['Contract Address', 'Info'],
        ['Pool Lotto4D', 'Last Draw Result'],
        ['Draw Result Lists', 'Winner Lists']
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});

bot.help((ctx) => {
    ctx.reply("Welcome to Lotto4DToken Bot! Choose an option:", {
        reply_markup: {
            keyboard: [
        ['Contract Address', 'Info'],
        ['Pool Lotto4D', 'Last Draw Result'],
        ['Draw Result Lists', 'Winner Lists']
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});

bot.hears('Contract Address', async (ctx) => {
    try {
        ctx.reply('SmartContract Address: 0x989c852D2fED95e2A7ef7392ee1223ea5B91b8c2\n' +
                  'Network: Polygon')
    } catch (error) {
        console.log('error', error)
        ctx.reply('error sending Contract Address')
    }
})

bot.hears('Info', async (ctx) => {
    try {
        ctx.reply('Website: https://lotto4d.app\n' +
            'Github: https://github.com/BTCincarnation/Lotto4d-SmartContract\n' +
            'Details Lotto4D Token\n' +
            'Token Name: Lotto 4 Digit\n' +
            'Symbol: L4D\n' +
            'Decimals: 9\n' +
            'Network: Polygon\n' +
            'Total Supply: 7.000.000 L4D\n' +
            'ICO Token: 6.000.000 L4D\n' +
            'Initial Lotto4D Pool Balance: 1.000.000 L4D\n' +
            'ICO Start At 10 Nov 2023 - 17 Nov 2023\n' +
            'ICO For Early Investor Price: 1 MATIC = 5 L4D\n' +
            'ICO At https://Cointool.app')
    } catch (error) {
        ctx.reply('error sending Info')
    }
})

// hears to get the contract balance
bot.hears('Pool Lotto4D', async (ctx) => {
    try {
        const contract = new w3.eth.Contract(contractABI, contractAddress);
        const contractBalance = await contract.methods.getContractBalance().call();
        ctx.reply(`Pool Lotto4D balance: ${w3.utils.fromWei(contractBalance, "gwei")} L4D`);
    } catch (error) {
        ctx.reply("Error retrieving the contract balance.");
    }
});

// hears to get the last draw result
bot.hears('Last Draw Result', async (ctx) => {
    try {
        const contract = new w3.eth.Contract(contractABI, contractAddress);
        const lastDrawResult = await contract.methods.getLastDrawResult().call();
        ctx.reply(`Last Draw Result: ${lastDrawResult.padStart(4, '0')}`);
    } catch (error) {
        console.error('Error retrieving the last draw result:', error);
        ctx.reply("Error retrieving the last draw result.");
    }
});

// hears to get all draw results
bot.hears('Draw Result Lists', async (ctx) => {
    try {
        const contract = new w3.eth.Contract(contractABI, contractAddress);
        const allDrawResults = await contract.methods.getAllDrawResults().call();
        let resultText = 'Draw Result Lists:\n';

        if (allDrawResults.length === 0) {
            resultText = 'No draw results found.';
        } else {
            allDrawResults.forEach((result, index) => {
                const timestamp = new Date(result.timestamp * 1000); // Convert timestamp to a readable date
                resultText += `Draw #${index + 1}: ${result.result.padStart(4, '0')}, Date: ${timestamp}\n`;
            });
        }
        ctx.reply(resultText);
    } catch (error) {
        ctx.reply("Error retrieving draw result lists.");
    }
});

// hears to get all winners
bot.hears('Winner Lists', async (ctx) => {
    try {
        const contract = new w3.eth.Contract(contractABI, contractAddress);
        const allWinners = await contract.methods.getWinnerLists().call();
        let winnersText = 'Winner Lists:\n';

        if (allWinners.length === 0) {
            winnersText = 'No winners found.';
        } else {
            allWinners.forEach((winner, index) => {
                let betAmount = 'N/A';
                let winAmount = 'N/A';

                if (winner.betAmount !== undefined) {
                    betAmount = w3.utils.fromWei(winner.betAmount.toString(), 'gwei');
                }

                if (winner.winAmount !== undefined) {
                    winAmount = w3.utils.fromWei(winner.winAmount.toString(), 'gwei');
                }

                winnersText += `#${index + 1} - Address: ${winner.addressWin.slice(0, 15)}xxxxxx}, Result: ${winner.drawNum.padStart(4, '0')}, Bet: ${betAmount} L4D, Win: ${winAmount} L4D, Digit: ${winner.digit}\n`;
            });
        }
        ctx.reply(winnersText);
    } catch (error) {
        console.error('Error retrieving winners:', error);
        ctx.reply("Error retrieving winners.");
    }
});

  bot.launch();

 // Enable graceful stop
 process.once('SIGINT', () => bot.stop('SIGINT'));
 process.once('SIGTERM', () => bot.stop('SIGTERM'));

expressApp.get("/", (req, res) => {
  res.send('Lotto4dBot!');
});

expressApp.listen(port, () => console.log(`Listening on ${port}`));
