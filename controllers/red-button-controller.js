const { buttonCreator } = require('../helpers/button-helper');
const { isEmptyContacts, sendEmptyContactsMessage } = require('../helpers/contacts-helper');
const { Markup} = require('telegraf');
const { getTranslation } = require('../services/translationService');
const { message } = require('telegraf/filters');
const { sender } = require('../helpers/sender');
const redButtonHandler = async (ctx, { bot }) => {
    try {
        if (await isEmptyContacts(ctx)) {
            return await sendEmptyContactsMessage(ctx);
        }
        await ctx.reply(
            getTranslation('red-btn-text'),
            Markup.keyboard([
                [Markup.button.locationRequest(getTranslation('red-btn-request'))],
                [getTranslation('cancel')]
            ]).oneTime().resize(),
        )

        bot.on(message('location'), async ctx => {
            await ctx.reply(
                getTranslation('locationReceived'),
                Markup.removeKeyboard(),
            );
            await sender({ ctx });
            await ctx.reply(
                getTranslation('locationSent'),
                Markup.inlineKeyboard([
                    [Markup.button.callback(getTranslation('main'), 'main')]
                ]));
        })
    } catch (err) {
        console.log('err to render red button', err);
    }
}
const RedButton = buttonCreator('red-btn', 'red-btn', redButtonHandler)
module.exports = RedButton;
