#!/bin/bash

node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v3/schemas/definitions/transaction-sign-response-algorand.ts' --tsconfig 'tsconfig.json' -c > src/serializer/v3/schemas/generated/transaction-sign-response-algorand.json
node_modules/.bin/ts-json-schema-generator --path 'src/serializer/v3/schemas/definitions/transaction-sign-request-algorand.ts' --tsconfig 'tsconfig.json' -c > src/serializer/v3/schemas/generated/transaction-sign-request-algorand.json