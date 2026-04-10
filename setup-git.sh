#!/bin/bash

read -p "Enter your name: " GIT_NAME
read -p "Enter your email: " GIT_EMAIL

git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"

cat .gitconfig >> ~/.gitconfig