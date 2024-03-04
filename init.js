db = db.getSiblingDB('dbname');
db.createUser({
    user: 'username',
    pwd: 'password',
    roles: [{ role: 'readWrite', db: 'liberty' }]
});
