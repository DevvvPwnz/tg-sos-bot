const User = require('../models/User');
const { Markup} = require('telegraf');
const { getTranslation } = require('../services/translationService');
require('dotenv').config();

const isAdmin = (ctx) => parseInt(ctx.from.id, 10)
    === parseInt(process.env.TELEGRAM_BOT_ADMIN, 10);
const setAdmin = (bot) => {
    bot.command('stat', async ctx => {
        if (isAdmin(ctx)) {
            const userCount = await User.countDocuments();
            ctx.reply(`Users: ${userCount}`,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(getTranslation('main'), 'main'),
                    ]
                ]))
        }
    });

    bot.command('stat', async ctx => {
        if (isAdmin(ctx)) {
            const userCount = await User.countDocuments();
            ctx.reply(`Users: ${userCount}`,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(getTranslation('main'), 'main'),
                    ]
                ]))
        }
    });
};

module.exports = setAdmin;
