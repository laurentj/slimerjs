#!/bin/bash

CURRENTDIR=`pwd`
SRCDIR=$(dirname $0)/../src

cd $SRCDIR
zip -r ../slimerjs.xpi *

cd $CURRENTDIR