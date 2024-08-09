#!/bin/bash

# Check if all required arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <template_file> <user_code_file> <test_data_file>"
    exit 1
fi

# echo "Running JavaScript environment"

TEMPLATE_FILE=$1
USER_CODE_FILE=$2
TEST_DATA_FILE=$3

# echo "Template file: $TEMPLATE_FILE"
# echo "User code file: $USER_CODE_FILE"
# echo "Test data file: $TEST_DATA_FILE"

cat $USER_CODE_FILE >> temp.js
echo "" >> temp.js
cat $TEMPLATE_FILE >> temp.js

node temp.js $TEST_DATA_FILE

cat test-results.json