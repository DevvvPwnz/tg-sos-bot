const { Markup} = require('telegraf');
const { renderButtons, mapButtons } = require('../helpers/button-helper');

const getMainNavigation = (navigation) => {
    return [
        'Меню',
        Markup.inlineKeyboard(renderButtons(navigation))
    ];
};
const initNavigation = ({ bot, navigation, wrapper }) => {
    const setAction = (navItem) => {
        const { data } = navItem;
        const handler = navItem?.handler;
        if (handler) {
            const wrappedHandler = (ctx) => wrapper(ctx, handler);
            bot.action(data, wrappedHandler);
        }
    };

    const mappedNav = mapButtons(navigation);

    const setBotActions = (list) => list.forEach((navItem) => {
        setAction(navItem);
        const items = navItem?.items;
        if (items) {
            setBotActions(items);
        }
    });
    setBotActions(mappedNav);

    return {
        getMainKeyboard: () => getMainNavigation(navigation),
    };
};

module.exports = { initNavigation };
