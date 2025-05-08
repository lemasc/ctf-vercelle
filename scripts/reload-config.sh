#!/bin/sh

supervisorctl signal USR2 php-fpm
supervisorctl signal HUP nginx