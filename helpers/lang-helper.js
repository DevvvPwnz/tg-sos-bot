const { findUserById } = require('../services/userService');
const i18n = require('../i18n.config.js');

class Language {
    constructor(redis) {
        this.redisClient = redis;
    }

    async setLanguage(id) {
       try {
           const redisLang = await this.redisClient.get(id.toString());
           if (!redisLang) {
               const existedUser = await findUserById(id);
               if (existedUser) {
                   const { lang } = existedUser;
                   await this.redisClient.set(id.toString(), lang, 'EX', 3600);
                   i18n.setLocale(lang);
               }
           } else {
               i18n.setLocale(redisLang);
           }
       } catch (err) {
           console.log('err to set lang', err);
       }
    }
}

module.exports = Language;
