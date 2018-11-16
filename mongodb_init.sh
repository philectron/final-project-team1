# start mongod service first
sudo service mongod start

# then log in to mongo shell and init DB
mongo << EOF
use osu_cs290_gymrats
db.createCollection('users')
EOF
