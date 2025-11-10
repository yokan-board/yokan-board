#!/bin/bash

docker run -p 3001:3001 \
    -v "$(pwd)/data:/app/data" \
    --name yokan-server \
    -e INITIAL_USER_ID=user \
    -e INITIAL_USER_PASSWORD=password \
    -e INITIAL_USER_EMAIL=yokan.board@gmail.com \
    -e DB_FILE=/app/data/db.sqlite \
    -e HOST=0.0.0.0 \
    -e JWT_SECRET=supersecretjwtkey \
    yokan-server