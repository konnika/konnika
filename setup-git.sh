#!/bin/bash

read -p "Enter your name for git: " GIT_NAME
read -p "Enter your email for git: " GIT_EMAIL

git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"

git config --global alias.ls "status"
git config --global alias.co "checkout"
git config --global alias.pr "pull --rebase"
git config --global alias.logl "log --oneline --graph -20"