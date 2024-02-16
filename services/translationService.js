const i18n = require('./../i18n.config');
const localization = require('./../locales/messages.js');

const getTranslation = (constant, lang) => {
   try {
       const currentLanguage = lang || i18n.getLocale();
       const { messages } = localization;
       const message = messages[constant][currentLanguage];
       return message || constant;
   } catch (err) {
       console.log('err to get translation', err);
       return constant;
   }
}
module.exports = { getTranslation };
