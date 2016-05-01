#!/usr/bin/env bash
set -e

echo "Updating Apt repository"
sudo add-apt-repository ppa:fkrull/deadsnakes
sudo apt-get update -y
sudo apt-get upgrade -y

echo "Installing essential packages"
sudo apt-get install -y build-essential libpq-dev g++ make curl gettext sqlite redis-server
sudo apt-get install -y git mercurial nodejs npm postgresql postgresql-contrib nginx supervisor

echo "Installing Python 3.5"
sudo apt-get install -y python3.5

echo "Installing Python dev packages"
sudo apt-get install -y python3.5-dev python-setuptools python-pip python-virtualenv

echo "Installing Node and Ruby packages"
sudo gem install sass

echo "Creating environment"
[ -d $HOME/env ] || virtualenv --python=python3.5 $HOME/env
[ -e $HOME/.bash_profile ] || echo "export LC_ALL=en_US.utf8; source ~/env/bin/activate; cd /var/www/hardchat.ru" > $HOME/.bash_profile

echo "Installing project dependencies"
$HOME/env/bin/pip3 install -q -r /var/www/hardchat.ru/requirements/pip.txt