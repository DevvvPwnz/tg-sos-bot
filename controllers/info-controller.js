const { buttonCreator } = require('../helpers/button-helper');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');

const handler = async(ctx) => {
    const info = getTranslation('infoText');
    try {
       await ctx.editMessageText(
           info,
           Markup.inlineKeyboard([
               [
                   Markup.button.callback(getTranslation('main'), "main"),
               ]
           ]),
       );
    } catch (err) {
        console.log('err to get info', err);
    }
}
const Info = buttonCreator('info', 'info', handler);
module.exports = Info;
