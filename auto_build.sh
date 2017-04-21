#!/bin/bash
WEB_PATH='/home/perficient/TrainingAgreementNew'
cd $WEB_PATH
git reset --hard origin/master
git clean -f
git pull
