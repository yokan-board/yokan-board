#!/bin/bash

docker run -p 3000:3000 \
    --name yokan-client \
    -e HOST=0.0.0.0 \
    -e REACT_APP_SERVER_URL=http://localhost:3001/api/v1.1 \
    yokan-board/yokan-client:latest