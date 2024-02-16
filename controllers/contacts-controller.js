const { getTranslation } = require('../services/translationService');
const { Markup} = require('telegraf');
const { buttonCreator, renderButtons } = require('../helpers/button-helper');
const { findUserById } = require('../services/userService');

const handleAddContacts = async (ctx) => {
    try {
        const buttons = Markup.inlineKeyboard([
            [
                Markup.button.callback(getTranslation('return'), 'contacts'),
                Markup.button.callback(getTranslation('main'), 'main'),
            ]
        ]);
        const { id } = ctx.from;
        const link = `https://t.me/liberty_chance_bot?start=${id}`;
        const messageText = `${getTranslation('add-text')}` +
            `<code>${link}</code>`;
        return await ctx.editMessageText(
            {
                parse_mode: 'HTML',
                text: messageText,
                reply_markup: buttons.reply_markup,
            }
        );
    } catch (err) {
        console.log('err to add contacts', err);
    }
};

const emptyList = async (ctx) => await ctx.editMessageText(
    getTranslation('emptyList'),
    Markup.inlineKeyboard([
        [
            Markup.button.callback(getTranslation('add'), 'add'),
            Markup.button.callback(getTranslation('return'), 'contacts'),
        ]
    ])
);

const contactsNavigation = async (ctx) => await ctx.editMessageText(
    getTranslation('contactsText'),
    Markup.inlineKeyboard(renderButtons(CONTACTS)));

const getUser = async (ctx) => {
    const { id } = ctx.from;
    return await findUserById(id);
}

const getContacts = async (ctx) => {
    const user = await getUser(ctx);
    return user?.contacts;
};

const extractUserData = (ctx) => {
    const { data } = ctx.callbackQuery;
    const userData = data.split('-');
    const [_, userId, userName ] = userData;
    return { userId, userName };
};

const removeFromContactsById = (list, userId) => list.filter((contact) => parseInt(contact.id, 10) !== parseInt(userId, 10));

const getContactsList = async (ctx, { bot })  => {
    try {
        const contacts = await getContacts(ctx);

        if (contacts && contacts?.length) {
            const mappedContacts = contacts.map((contact, i) => (`${i + 1}) @${contact.username}\n`));

            return await ctx.editMessageText(
                mappedContacts.join(''),
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(getTranslation('return'), 'contacts'),
                        Markup.button.callback(getTranslation('main'), 'main'),
                    ]
                ])
            );
        }
        return await emptyList(ctx);
    } catch (err) {
        console.log('err to get contacts list', err);
    }
}

const handleRemoveList = async (ctx) => {
    try {
        const contacts = await getContacts(ctx);
        if (contacts && contacts?.length) {
            const contactsList = contacts.map((contact) => (
                Markup.button.callback(`@${contact.username} ❌`, `remove-${contact.id}-${contact.username}`)
            ));
            return await ctx.editMessageText(
                getTranslation('remove-text'),
                Markup.inlineKeyboard([
                    contactsList,
                    [ Markup.button.callback(getTranslation('return'), 'contacts') ]
                ]),
            );
        }
        return await emptyList(ctx);
    } catch (err) {
        console.log('err to remove list', err);
    }
};

const handleRemove = async (ctx) => {
    try {
        const { userId, userName } = extractUserData(ctx);

        await ctx.editMessageText(
            `${getTranslation('confirm-remove')} @${userName} ?`,
            Markup.inlineKeyboard([
                [ Markup.button.callback(getTranslation('confirm'), `rmvcfm-${userId}-${userName}`) ],
                [ Markup.button.callback(getTranslation('cancel'), 'remove-list') ],
            ]),
        );
    } catch (err) {
        console.log('err to remove', err)
    }
};

const confirmRemove = async (ctx) => {
    try {
        const { userId } = extractUserData(ctx);
        const user = await getUser(ctx);
        const inviter = await findUserById(userId);
        const { contacts } = user;
        user.contacts = removeFromContactsById(contacts, userId);
        inviter.contacts = removeFromContactsById(inviter.contacts, user.id);
        await user.save();
        await inviter.save();
        await contactsNavigation(ctx);
    } catch (err) {
        console.log('err to confirm remove', err);
    }
};

const CONTACTS = [
    [
        buttonCreator('contacts-list', 'contacts-list', getContactsList),
    ],
    [
        buttonCreator('add', 'add', handleAddContacts),
        buttonCreator('remove-list', 'remove-list', handleRemoveList),
    ],
    [
        buttonCreator('main', 'main', null),
    ],
];


const removeButton = buttonCreator('remove-list', /\b\w*remove\w*\b/g, handleRemove);
const confirmRemoveButton = buttonCreator('confirm-remove', /\b\w*rmvcfm\w*\b/g, confirmRemove);

const ACTIONS = [...CONTACTS, removeButton, confirmRemoveButton];
const contactsHandler = async (ctx) => {
    try {
        await contactsNavigation(ctx);
    } catch (err) {
        console.log(`contacts: ${err}`)
    }
}

const Contacts = buttonCreator('contacts', 'contacts', contactsHandler, ACTIONS);

module.exports = Contacts;
