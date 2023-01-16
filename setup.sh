#!/bin/bash

echo "Checking Node.js version..."
which node > /dev/null || (echo "Node.js is not installed. Please install version 12 or higher and try again"; exit 1)
NODE_VERSION=$(node -v)

if [[ ${NODE_VERSION:1:2} -lt 12 ]]; then
	echo "You are using an outdated version of Node. Please install version 12 or higher and try again"
	exit 1;
fi
echo "Node.js installed!"

echo "Installing Stylus..."
sudo npm i -g stylus
echo "Compiling styles..."
npx stylus ./public/style
echo "Styles compiled!"

echo "Installing dependencies..."
npm i
echo "Dependencies installed!"

echo "Installed successfully! Run \"node app.js\" to start Siter"
