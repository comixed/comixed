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

package org.comixedproject.auditlog;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.comixedproject.model.auditlog.WebAuditLogEntry;
import org.comixedproject.service.auditlog.WebAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.util.ContentCachingRequestWrapper;

/**
 * <code>AuditableEndpointAspect</code> manages aspects relating to the REST APIs.
 *
 * @author Darryl L. Pierce
 */
@Aspect
@Configuration
@Log4j2
public class AuditableEndpointAspect {
  @Autowired private WebAuditLogService webAuditLogService;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Wraps REST API calls and records the results.
   *
   * @param joinPoint the join point.
   * @return the response object
   * @throws Throwable if any underying call raises an exception
   */
  @Around("@annotation(org.comixedproject.auditlog.AuditableEndpoint)")
  public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
    Throwable thrownError = null;
    Object response = null;
    final MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    final var annotation = signature.getMethod().getAnnotation(AuditableEndpoint.class);

    final var started = new Date();
    try {
      response = joinPoint.proceed();
    } catch (Throwable throwable) {
      thrownError = throwable;
    }
    final var ended = new Date();
    final var entry = new WebAuditLogEntry();
    HttpServletRequest request =
        ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

    if (request.getUserPrincipal() != null) {
      entry.setEmail(request.getUserPrincipal().getName());
    } else {
      entry.setEmail("anonymous");
    }
    entry.setRemoteIp(request.getRemoteAddr());
    entry.setUrl(request.getRequestURI());
    entry.setMethod(request.getMethod());
    entry.setStartTime(started);
    entry.setEndTime(ended);
    if (annotation.logRequest()) {
      log.trace("Logging request content");
      if (annotation.requestView() != Class.class) {
        entry.setRequestContent(
            this.objectMapper.writerWithView(annotation.requestView()).writeValueAsString(request));
      } else {
        entry.setRequestContent(
            new String(((ContentCachingRequestWrapper) request).getContentAsByteArray()));
      }
    }
    if (annotation.logResponse()) {
      log.trace("Logging response content");
      if (annotation.responseView() != Class.class) {
        entry.setResponseContent(
            this.objectMapper
                .writerWithView(annotation.responseView())
                .writeValueAsString(response));
      } else {
        entry.setResponseContent(this.objectMapper.writeValueAsString(response));
      }
    }

    if (thrownError != null) {
      log.debug("Storing method exception stacktrace");
      final var stringWriter = new StringWriter();
      final var printWriter = new PrintWriter(stringWriter);
      thrownError.printStackTrace(printWriter);
      entry.setException(stringWriter.toString());
      entry.setSuccessful(false);
    } else {
      entry.setSuccessful(true);
    }

    this.webAuditLogService.save(entry);

    if (thrownError != null) throw thrownError;
    return response;
  }
}
