const { findUserById } = require('../services/userService');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');
const isEmptyContacts = async(ctx) => {
    try {
        const user = await findUserById(ctx.from.id);
        return !user?.contacts?.length;
    } catch (err) {
        console.log('err to check contacts length', err);
        return true;
    }
};

const sendEmptyContactsMessage = async (ctx, msg = 'emptyListDescription') => await ctx.editMessageText(
    getTranslation(msg),
    Markup.inlineKeyboard([
        [
            Markup.button.callback(getTranslation('add'), 'add'),
            Markup.button.callback(getTranslation('return'), 'main'),
        ]
    ])
);
module.exports = { isEmptyContacts, sendEmptyContactsMessage };
