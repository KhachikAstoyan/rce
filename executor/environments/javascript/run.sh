#!/bin/bash

if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <template_file> <skeleton_file> <user_code_file> <test_data_file>"
    exit 1
fi


TEMPLATE_FILE=$1
PROBLEM_SKELETON_FILE=$2
USER_CODE_FILE=$3
TEST_DATA_FILE=$4

cat $USER_CODE_FILE >> temp.js
echo "" >> temp.js
cat $PROBLEM_SKELETON_FILE >> temp.js
echo "" >> temp.js
cat $TEMPLATE_FILE >> temp.js

node temp.js $TEST_DATA_FILE

cat test-results.json