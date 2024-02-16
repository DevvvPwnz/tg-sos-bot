db = db.getSiblingDB('liberty');
db.createUser({
    user: 'g00d',
    pwd: 'g00dPwnz',
    roles: [{ role: 'readWrite', db: 'liberty' }]
});
