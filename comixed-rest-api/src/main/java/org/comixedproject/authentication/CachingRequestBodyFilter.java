/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;
import org.springframework.web.util.ContentCachingRequestWrapper;

/**
 * <code>CachingRequestBodyFilter</code> provides a filter that wraps the incoming request in a
 * caching request object.
 *
 * @author Darryl L. Pierce
 */
@Component
public class CachingRequestBodyFilter extends GenericFilterBean {
  @Override
  public void doFilter(
      ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest currentRequest = (HttpServletRequest) servletRequest;
    ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(currentRequest);

    chain.doFilter(wrappedRequest, servletResponse);
  }
}
