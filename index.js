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
const w3 = new Web3(new Web3.providers.HttpProvider('https://polygon.llamarpc.com'));

const contractAddress = '0x07E78d26FCfF2E3bcAb75AB2cCaA7AFD5E84cEe2';

// Define the commands that your bot will respond to
bot.start((ctx) => {
    ctx.reply("Welcome to Lotto4DToken Bot! Choose an option:", {
        reply_markup: {
            keyboard: [
        ['Contract Address', 'Info', 'Events'],
        ['Pool Lotto4D', 'Last Draw Result'],
        ['Draw Result Lists', 'Winner Lists']
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    });
});
bot.menu((ctx) => {
    ctx.reply("Welcome to Lotto4DToken Bot! Choose an option:", {
        reply_markup: {
            keyboard: [
        ['Contract Address', 'Info', 'Events'],
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
        ['Contract Address', 'Info', 'Events'],
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
        ctx.reply('SmartContract Address: 0x07E78d26FCfF2E3bcAb75AB2cCaA7AFD5E84cEe2\n' +
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
            'Total Supply: 10.000.000 L4D\n' +
            'ICO Token: 9.000.000 L4D\n' +
            'Initial Lotto4D Pool Balance: 1.000.000 L4D\n' +
            'ICO Start At 02 Nov 2023 - 09 Nov 2023\n' +
            'ICO For Early Investor Price: 1 MATIC = 5 L4D\n' +
            'ICO At https://www.pinksale.finance/launchpad/0x40A6C7D7D41bF74d910AD26A558c6Fd885c73a77?chain=Matic')
    } catch (error) {
        ctx.reply('error sending Info')
    }
})

bot.hears('Info', async (ctx) => {
    try {
        ctx.reply('Events:\n' +
            '======================================\n' +
            'Event #1\n' +
            'Celeration Launch\n' +
            '1000 L4D Pool Giveaway For 100 User\n' +
            'Date: 02 Nov - 09 Nov 2023\n' +
            'Claim by submit the form\n' +
            'https://forms.gle/1igT8m5HPzyh3nuk8\n' +
            '--------------------------------------\n' +
            'Event #2\n' +
            'First Winners\n' +
            '1250 USDT Price Pool!\n' +
            'Become 1st Winner For:\n' +
            '2 digit guess number prize: 50 USDT\n' +
            '3 digit guess number prize: 200 USDT\n' +
            '4 digit guess number prize: 1000 USDT\n' +
            'Date: 02 Nov - 31 Des 2023\n' +
            'Distribute price send directly to \n' +
            'Winner wallet address, with in 3 business day')
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
