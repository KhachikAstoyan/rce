#!/bin/bash
if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <template_file> <skeleton_file> <user_code_file> <test_data_file> <submission_id>"
  exit 1
fi


TEMPLATE_FILE=$1
PROBLEM_SKELETON_FILE=$2
USER_CODE_FILE=$3
TEST_DATA_FILE=$4
SUBMISSION_ID=$5


cat $USER_CODE_FILE >> temp.ts 
echo "" >> runner.ts 
cat $PROBLEM_SKELETON_FILE >> temp.ts 
echo "" >> runner.ts 
cat $TEMPLATE_FILE >> temp.ts 

npm run build

node temp.js $TEST_DATA_FILE

cp test-results.json /app/results/$SUBMISSION_ID.json
