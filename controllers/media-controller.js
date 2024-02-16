const { buttonCreator } = require('../helpers/button-helper');
const { message } = require('telegraf/filters');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');
const { isEmptyContacts, sendEmptyContactsMessage } = require('../helpers/contacts-helper');
const { SenderTypes, sender } = require('../helpers/sender');

const mediaHandler = async (ctx, { bot }) => {
    try {
        if (await isEmptyContacts(ctx)) {
            return await sendEmptyContactsMessage(ctx, 'emptyListMedia');
        }

        await ctx.editMessageText(
            getTranslation('mediaText'),
            Markup.inlineKeyboard([
                [Markup.button.callback(getTranslation('main'), 'main')]
            ]));

        const getSuccessMsg = async (ctx) => await ctx.reply(
            getTranslation('mediaSent'),
            Markup.inlineKeyboard([
                [Markup.button.callback(getTranslation('main'), 'main')]
            ]));

        bot.on(message('photo'), async ctx => {
            try {
                const photoId = ctx.message.photo[2].file_id;
                await ctx.reply(getTranslation('photoReceived'));
                await sender({
                    ctx,
                    type: SenderTypes.PHOTO,
                    mediaId: photoId,
                })
                await getSuccessMsg(ctx);
            } catch (err) {
                console.log('err to send photo', err);
            }
        });

        bot.on(message('video'), async ctx => {
            try {
                const videoId = ctx.message.video.file_id;
                await ctx.reply(getTranslation('videoReceived'));
                await sender({
                    ctx,
                    type: SenderTypes.VIDEO,
                    mediaId: videoId,
                })
                await getSuccessMsg(ctx);
            } catch (err) {
                console.log('err to send video', err);
            }
        });

    } catch (err) {
        console.log('err to get media', err);
    }
}
const Media = buttonCreator('media', 'media', mediaHandler);
module.exports = Media;
