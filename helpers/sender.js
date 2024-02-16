const { findUserById } = require('../services/userService');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');

const SenderTypes = {
    LOCATION: 'LOCATION',
    PHOTO: 'PHOTO',
    VIDEO: 'VIDEO',
};

const sendLocation = async ({ ctx, contact }) => {
    const { latitude, longitude } = ctx.message.location;
    await ctx.replyWithLocation(
        latitude,
        longitude,
        { chat_id: contact.id },
    );
};

const sendPhoto = async ({ ctx, contact, mediaId }) => {
    await ctx.replyWithPhoto(
        mediaId,
        { chat_id: contact.id },
    );
};

const sendVideo = async ({ ctx, contact, mediaId }) => {
    await ctx.replyWithVideo(
        mediaId,
        { chat_id: contact.id },
    );
};

const send = async (data) => {
    const { type } = data;
    switch (type) {
        case SenderTypes.LOCATION:
            return await sendLocation(data);
        case SenderTypes.PHOTO:
            return await sendPhoto(data);
        case SenderTypes.VIDEO:
            return await sendVideo(data);
        default: return await sendLocation(data);
    }
};

const sender = async (data) => {
    try {
        const { ctx } = data;
        const user = await findUserById(ctx.from.id);
        const { contacts } = user;
        for (const contact of contacts) {
            await send({ ...data, contact });
            const userFromContacts = await findUserById(contact.id);
            const lang = userFromContacts?.lang;
            const text = `${getTranslation('senderText', lang)} @${user.username}`;
            await ctx.reply(
                {
                    text,
                    reply_markup: Markup.inlineKeyboard([
                        [
                            Markup.button.callback(getTranslation('main', lang), 'main'),
                        ]
                    ]).reply_markup,
                    chat_id: contact.id,
                }
            );
        }
    } catch (err) {
        console.log('sender err', err);
    }
}
module.exports = { sender, SenderTypes };
