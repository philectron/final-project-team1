# start mongod service first
sudo service mongod start

# then log in to mongo shell and init DB
mongo << EOF
use gymrats
db.createCollection('users')
EOF
