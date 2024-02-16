const { I18n } = require('i18n');

const i18n = new I18n({
    locales: ['ru', 'uk'],
    defaultLocale: 'uk',
});

module.exports = i18n;
