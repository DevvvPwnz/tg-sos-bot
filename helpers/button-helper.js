const {getTranslation} = require('../services/translationService');
const {Markup} = require('telegraf');

const mapButtons = (items) => {
    if (items) {
       return items.flat();
    }
    return null;
};

const buttonCreator = (text, data, handler, items = null) => ({
    text,
    data,
    handler,
    getButton: () => Markup.button.callback(getTranslation(text), data),
    items: mapButtons(items),
});
const extractButton = ({ text, data }) => (Markup.button.callback(getTranslation(text), data));

const renderButtons = (buttons) => buttons.map((row) => (
    row.map((button) => (button.getButton()))
));

module.exports = {
    buttonCreator,
    extractButton,
    renderButtons,
    mapButtons,
}
