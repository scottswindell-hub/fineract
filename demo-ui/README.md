<!--
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

# Portfolio transaction review demo

This is an isolated React/Vite fixture for demonstrating visual-versus-semantic UI change detection. It is not a Fineract product UI and never calls a Fineract API.

The finance controls, defaults, and action behavior live in `src/semanticContract.ts`. Decorative text lives in `src/decorativeCopy.ts`, and visual rules live in `src/styles.css`. The rendered elements retain stable `data-demo-role` and `data-semantic-key` markers so a title or color change can be distinguished from a change to a financial control.

## Run locally

```bash
npm ci
npm run lint
npm test
npm run build
npm run preview
```

The preview command prints a local URL. The page uses fictional data, stores no state, makes no network connection, and does not submit or save transactions.
