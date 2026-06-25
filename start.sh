#!/bin/bash

# Start backend server
kitty --title "WashQueue Server" sh -c "
cd ./server && pnpm run dev;
exec bash
" &

# Start frontend client
kitty --title "WashQueue Client" sh -c "
cd ./client && pnpm run dev --host;
exec bash
" &