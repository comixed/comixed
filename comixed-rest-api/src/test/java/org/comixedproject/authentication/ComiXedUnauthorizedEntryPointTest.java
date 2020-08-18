/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.authentication;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.core.AuthenticationException;

@RunWith(MockitoJUnitRunner.class)
public class ComiXedUnauthorizedEntryPointTest {
  @InjectMocks private ComiXedUnauthorizedEntryPoint entryPoint;
  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @Mock private AuthenticationException authException;

  @Test
  public void testCommence() throws IOException, ServletException {
    entryPoint.commence(request, response, authException);

    Mockito.verify(response, Mockito.times(1))
        .sendError(HttpServletResponse.SC_UNAUTHORIZED, ComiXedUnauthorizedEntryPoint.UNAUTHORIZED);
  }
}
