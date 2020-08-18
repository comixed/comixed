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

import static junit.framework.TestCase.*;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.web.util.ContentCachingRequestWrapper;

@RunWith(MockitoJUnitRunner.class)
public class CachingRequestBodyFilterTest {
  @InjectMocks private CachingRequestBodyFilter filter;
  @Mock HttpServletRequest servletRequest;
  @Mock ServletResponse servletResponse;
  @Mock FilterChain chain;
  @Captor private ArgumentCaptor<ServletRequest> servletRequestArgumentCaptor;

  @Test
  public void testDoFilter() throws IOException, ServletException {
    Mockito.doNothing().when(chain).doFilter(servletRequestArgumentCaptor.capture(), Mockito.any());

    filter.doFilter(servletRequest, servletResponse, chain);

    assertNotNull(servletRequestArgumentCaptor.getValue());
    assertTrue(servletRequestArgumentCaptor.getValue() instanceof ContentCachingRequestWrapper);
    assertSame(
        servletRequest,
        ((ContentCachingRequestWrapper) servletRequestArgumentCaptor.getValue()).getRequest());

    Mockito.verify(chain, Mockito.times(1))
        .doFilter(servletRequestArgumentCaptor.getValue(), servletResponse);
  }
}
