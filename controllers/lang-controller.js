const { buttonCreator } = require('../helpers/button-helper');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');
const { findUserById } = require('../services/userService');
const User = require('../models/User');
const i18n = require('../i18n.config');

const LANG_SETTINGS = ['UK', 'RU'];

const handleSetLang = async (ctx, { Navigation, redisClient, handleAddNewContact }) => {
    try {
        const { username, id } = ctx.from;
        const lang = ctx.callbackQuery.data.toLowerCase();
        const existedUser = await findUserById(id);
        if (existedUser) {
            existedUser.lang = lang;
            await existedUser.save();
            const ref = existedUser?.ref;
            if (ref) {
                return handleAddNewContact(ctx, ref.username);
            }
        } else {
            await User.create({
                username,
                id,
                lang,
            });
        }
        await redisClient.set(id.toString(), lang, 'EX', 3600);
        i18n.setLocale(lang);
        await ctx.editMessageText(...Navigation.getMainKeyboard());
    } catch (err) {
        console.log('err to set lang', err);
    }
};

const LANG_BUTTONS = [
    LANG_SETTINGS.map((langAlias) => (
        buttonCreator(langAlias, langAlias, handleSetLang)
    ))
];

const handler = async (ctx) => {
    const langContent = [
        getTranslation('lang'),
        Markup.inlineKeyboard([
            LANG_SETTINGS.map((langAlias) => Markup.button.callback(langAlias, langAlias))
        ]),
    ];
    try {
        if (ctx?.callbackQuery) {
            return await ctx.editMessageText(...langContent);
        }
        await ctx.reply(...langContent);
    } catch (err) {
        console.log('err to get lang buttons', err);
    }
};

const LangSettings = buttonCreator('lang-setting', 'lang', handler, LANG_BUTTONS);

module.exports = LangSettings;
