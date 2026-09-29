/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.fineract.infrastructure.security.api;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class AuthenticationApiResourceTest {

    private final AuthenticationApiResource authenticationApiResource = new AuthenticationApiResource(null, null, null);

    @Test
    void doesNotIncludeRequestBodyWhenItDeserializesToNull() {
        assertThatThrownBy(() -> authenticationApiResource.authenticate("null")).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid JSON in BODY (no longer URL param; see FINERACT-726) of POST to /authentication");
    }

    @Test
    void doesNotExposePasswordWhenCredentialsAreMissing() {
        String password = "must-not-appear-in-errors";
        String requestBody = "{\"username\":null,\"password\":\"" + password + "\"}";

        assertThatThrownBy(() -> authenticationApiResource.authenticate(requestBody)).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username or Password is null in JSON (see FINERACT-726) of POST to /authentication")
                .hasMessageNotContaining(password);
    }
}
