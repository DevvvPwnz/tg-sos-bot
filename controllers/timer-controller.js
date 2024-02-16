const { buttonCreator } = require('../helpers/button-helper');
const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');
const { message } = require('telegraf/filters');
const { sender } = require('../helpers/sender');
const { isEmptyContacts, sendEmptyContactsMessage } = require('../helpers/contacts-helper');



const timers = new Map();
const setTimer = (ctx, timerId) => timers.set(ctx.from.id, timerId);
const getTimerId = (ctx, timerId) => timers.get(ctx.from.id);
const hasActiveTimer = (ctx) => timers.has(ctx.from.id);
const clearTimerById = (ctx) => {
    const timerId = getTimerId(ctx);
    timers.delete(ctx.from.id);
    if (timerId) {
        clearTimeout(timerId);
    }
};

async function timerHandler (ctx, { bot, Navigation, langService }) {
    const timerValue = parseInt(ctx.callbackQuery.data, 10) * 60 * 1000;
    const cancel = getTranslation('cancel');
    try {
        await ctx.reply(
            'Запуск таймера',
            Markup.keyboard([
                [Markup.button.locationRequest(getTranslation('startTimer'))],
                [cancel]
            ]).oneTime().resize(),
        )
    } catch (err) {
        console.log('err to set timer', err);
    }

    let timerId = null;

    bot.on(message('location'), async ctx => {
        try {
            if (!hasActiveTimer(ctx)) {
                timerId = setTimeout(async () => {
                    clearTimerById(ctx);
                    await langService.setLanguage(ctx.from.id);
                    await sender({ ctx });
                    await ctx.reply(
                        getTranslation('locationSent'),
                        Markup.inlineKeyboard([
                            [Markup.button.callback(getTranslation('main'), 'main')]
                        ])
                    )
                }, timerValue);

                setTimer(ctx, timerId);
            }
            await langService.setLanguage(ctx.from.id);
            await ctx.reply(
                getTranslation('locationReceivedTimer'),
                Markup.removeKeyboard(),
            );

            await ctx.reply(
                getTranslation('timerStarted'),
                Markup.inlineKeyboard([
                    [Markup.button.callback(getTranslation('cancel'), 'clear-timer')],
                    [Markup.button.callback(getTranslation('main'), 'main')]
                ]));

        } catch (err) {
            console.log('location request error', err);
        }
    });

    bot.action('clear-timer', async ctx => {
        try {
            if (hasActiveTimer(ctx)) {
                clearTimerById(ctx);
            }
            await ctx.editMessageText(
                getTranslation('timerCanceled'),
                Markup.inlineKeyboard([
                    [Markup.button.callback(getTranslation('main'), 'main')]
                ])
            )
        } catch (err) {
            console.log('err to remove timer', err);
        }
    })

}

const getTimerButtonText = (minutes) => `⏳ ${minutes} ${getTranslation('minutes')}`;

const getTimerButtons = () =>( [
    [
        buttonCreator(getTimerButtonText(5), '5', timerHandler),
        buttonCreator(getTimerButtonText(10), '10', timerHandler)
    ],
    [
        buttonCreator(getTimerButtonText(15), '15', timerHandler),
    ],
]);

const handler = async (ctx) => {
    try {
        if (hasActiveTimer(ctx)) {
            return await ctx.editMessageText(getTranslation('timerStarted'),
                Markup.inlineKeyboard([
                    [Markup.button.callback(getTranslation('cancel'), 'clear-timer')],
                    [Markup.button.callback(getTranslation('main'), "main")]
                ]));
        }

        if (await isEmptyContacts(ctx)) {
            return await sendEmptyContactsMessage(ctx);
        }

        await ctx.editMessageText(
            getTranslation('timerText'),
            Markup.inlineKeyboard(
                [...getTimerButtons().map((row) => (
                    row.map((button) => (
                        Markup.button.callback(button.text, button.data)
                    ))
                )), [
                    Markup.button.callback(getTranslation('main'), 'main'),
                ]]),
        );
    } catch (err) {
        console.log('err to get timer', err);
    }

};

const Timer = buttonCreator('timer', 'timer', handler, getTimerButtons());
module.exports = Timer;
