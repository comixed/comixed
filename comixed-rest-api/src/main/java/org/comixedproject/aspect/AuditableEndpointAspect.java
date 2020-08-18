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

package org.comixedproject.aspect;

import java.util.Date;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.comixedproject.model.auditlog.RestAuditLogEntry;
import org.comixedproject.net.ApiResponse;
import org.comixedproject.service.auditlog.RestAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * <code>AuditableEndpointAspect</code> manages aspects relating to the REST APIs.
 *
 * @author Darryl L. Pierce
 */
@Aspect
@Configuration
public class AuditableEndpointAspect {
  @Autowired private RestAuditLogService restAuditLogService;

  /**
   * Wraps REST API calls and records the results.
   *
   * @param joinPoint the join point.
   * @return the response object
   */
  @Around("@annotation(org.comixedproject.aspect.AuditableEndpoint)")
  public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
    Throwable error = null;
    Object response = null;

    final Date started = new Date();
    try {
      response = joinPoint.proceed();
    } catch (Throwable throwable) {
      error = throwable;
    }
    final Date ended = new Date();
    if (response instanceof ApiResponse<?>) {
      final ApiResponse<?> apiResponse = (ApiResponse<?>) response;
      final RestAuditLogEntry entry = new RestAuditLogEntry();
      HttpServletRequest request =
          ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

      if (request.getUserPrincipal() != null) {
        entry.setEmai(request.getUserPrincipal().getName());
      } else {
        entry.setException("anonymous");
      }
      entry.setRemoteIp(request.getRemoteAddr());
      entry.setUrl(request.getRequestURI());
      entry.setMethod(request.getMethod());
      entry.setContent(
          request.getReader().lines().collect(Collectors.joining(System.lineSeparator())));
      entry.setStartTime(started);
      entry.setEndTime(ended);
      entry.setSuccessful(apiResponse.isSuccess());
      entry.setException(apiResponse.getError());
      this.restAuditLogService.save(entry);
    }
    if (error != null) throw error;
    return response;
  }
}
