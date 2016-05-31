# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.hostname = "hardchat-dev"
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder ".", "/var/www/hardchat.ru"

  config.vm.provision :shell, :path => "./requirements/vagrant_provision.sh", :privileged => false
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "private_network", ip: "192.168.2.2"

  config.vm.provider :virtualbox do |vb|
    vb.memory = 2048
    vb.name = "Vagrant - Hardchat Dev"
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
  end
end
