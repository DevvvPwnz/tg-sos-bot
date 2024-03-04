const { Telegraf, Markup} = require('telegraf')
const redis = require('redis');
const { getTranslation } = require('./services/translationService');
const { findUserById } = require('./services/userService');
const { connectToMongo } = require('./helpers/mongoose-connector');
const User = require('./models/User');
const Language = require('./helpers/lang-helper');
const Contacts= require('./controllers/contacts-controller');
const { initNavigation } = require('./controllers/navigation-controller');
const LangSettings = require('./controllers/lang-controller');
const Info = require('./controllers/info-controller');
const Timer = require('./controllers/timer-controller');
const RedButton = require('./controllers/red-button-controller');
const Media = require('./controllers/media-controller');
const setAdmin = require('./controllers/admin-controller');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const start = async() => {
    console.log('start')
    const client = redis.createClient({
        url: 'redis://redis:6379',
    });
    await connectToMongo();
    const redisClient = await client.connect();

    const langService = new Language(redisClient);

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    bot.launch();


    const NAVIGATION = [
        [ Info, LangSettings ],
        [ Contacts ],
        [ Media ],
        [ Timer ],
        [ RedButton ],
    ];

    const Navigation = initNavigation({
        bot,
        navigation: NAVIGATION,
        wrapper: handlerWithLang,
    });

    async function handlerWithLang (ctx, handler) {
        const { id } = ctx.from;
        await langService.setLanguage(id);
        const commonData = { Navigation, redisClient, handleAddNewContact, bot, langService };
        return handler(ctx, commonData);
    }

    const checkContactExist = (contacts, id) => contacts.find((contact) => parseInt(contact.id, 10) === parseInt(id, 10));

    async function handleAddNewContact (ctx, username){
        const getConfirmMassage = () => [
            `@${username} ${getTranslation('add-confirm')}`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(getTranslation('confirm'), 'confirm'),
                    Markup.button.callback(getTranslation('cancel'), 'main'),
                ]
            ])
        ]
        try {
            await langService.setLanguage(ctx.from.id);
            if (ctx?.callbackQuery) {
                return await ctx.editMessageText(...getConfirmMassage());
            }
            await ctx.reply(...getConfirmMassage());
        } catch (err) {
            console.log('handleAddNewContact err', err);
        }
    }

    bot.action('confirm', async (ctx) => {
        try {
            const { username, id } = ctx.from;
            const currentUser = await findUserById(id);
            const ref = currentUser?.ref;
            await langService.setLanguage(id);
            if (ref) {
                const inviter = await findUserById(ref.id);
                if (inviter) {
                    const { contacts } = inviter;
                    const myContact = { username, id };
                    if (!checkContactExist(contacts, id)) {
                        contacts.push(myContact);
                        await inviter.save();
                        if (!checkContactExist(currentUser.contacts, inviter.id)) {
                            currentUser.contacts.push({ username: inviter.username, id: inviter.id });
                        }
                        currentUser.ref = null;
                        await currentUser.save();
                    }
                }
            }
            await ctx.editMessageText(...Navigation.getMainKeyboard());
        } catch (err) {
            console.log('cannot add new contact', err);
        }
    })

    bot.command('start', async ctx => {
        try {
            const { username, id } = ctx.from;
            const payload = ctx.payload;
            const currentUser = await findUserById(id);

            if (payload) {
                const inviter = await findUserById(payload);
                if (inviter && (payload !== id)) {
                    const ref=  {
                        username: inviter.username,
                        id: inviter.id,
                    };

                    if (currentUser) {
                        const { contacts } = inviter;
                        const contactsAlreadyExist = checkContactExist(contacts, id);
                        await langService.setLanguage(id);
                        if (contactsAlreadyExist) {
                            return await ctx.reply(
                                `${getTranslation('alreadyExist')} @${username}`,
                                Markup.inlineKeyboard([
                                    [
                                        Markup.button.callback(getTranslation('main'), 'main'),
                                    ]
                                ])
                            )
                        }
                        currentUser.ref = ref;
                        await currentUser.save();
                        return handleAddNewContact(ctx, inviter.username);
                    }
                    await User.create({
                        username,
                        id,
                        lang: 'ru',
                        ref,
                    });
                }
            }

            if (currentUser) {
                try {
                    await langService.setLanguage(id);
                    return ctx.reply(...Navigation.getMainKeyboard());
                } catch (err) {
                    console.log('err to start ', err);
                    return err;
                }
            }
            return handlerWithLang(ctx, LangSettings.handler);
        } catch (err) {
            console.log('err to start', err);
        }
    });

    bot.action('main', async ctx => {
        try {
            await handlerWithLang(ctx, () => ctx.editMessageText(...Navigation.getMainKeyboard()));
        } catch (err) {
            console.log('cannot back ', err)
        }
    });

    bot.hears(getTranslation('cancel'), async (ctx) => {
        try {
            await handlerWithLang(ctx, () => ctx.reply(...Navigation.getMainKeyboard()))
        } catch (err) {
            console.log('err to return from timer', err);
        }
    });

    setAdmin(bot);

    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))

}
start();

