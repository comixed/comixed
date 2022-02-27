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

package org.comixedproject.auditlog.rest;

import static junit.framework.TestCase.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.security.Principal;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.comixedproject.model.auditlog.WebAuditLogEntry;
import org.comixedproject.service.auditlog.WebAuditLogService;
import org.comixedproject.views.View;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.util.ContentCachingRequestWrapper;

@RunWith(MockitoJUnitRunner.class)
public class AuditableRestEndpointAspectTest {
  private static final String TEST_OBJECT_AS_STRING = "This is a JSON-encoded object";
  private static final String TEST_OBJECT_AS_STRING_NO_VIEW =
      "This is the encoded object without a view";
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private AuditableRestEndpointAspect auditableRestEndpointAspect;
  @Mock private WebAuditLogService webAuditLogService;
  @Mock private ProceedingJoinPoint proceedingJoinPoint;
  @Mock private Object response;
  @Mock private WebAuditLogEntry savedEntry;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;
  @Mock private ContentCachingRequestWrapper requestWrapper;
  @Mock private Principal principal;
  @Mock private MethodSignature methodSignature;

  @Captor private ArgumentCaptor<WebAuditLogEntry> restAuditLogEntryArgumentCaptor;

  @Before
  public void setUp() throws JsonProcessingException {
    RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(requestWrapper));
    Mockito.when(requestWrapper.getContentAsByteArray())
        .thenReturn(TEST_OBJECT_AS_STRING_NO_VIEW.getBytes());
    Mockito.when(objectMapper.writeValueAsString(Mockito.any()))
        .thenReturn(TEST_OBJECT_AS_STRING_NO_VIEW);
    Mockito.when(objectMapper.writerWithView(View.GenericObjectView.class))
        .thenReturn(objectWriter);
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_OBJECT_AS_STRING);
    Mockito.when(proceedingJoinPoint.getSignature()).thenReturn(methodSignature);
  }

  @Test
  public void testAroundLogRequest() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithLoggedRequest"));
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenReturn(response);

    final Object result = auditableRestEndpointAspect.around(proceedingJoinPoint);

    assertNotNull(result);
    assertSame(response, result);

    final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
    assertNotNull(entry);
    assertNull(entry.getResponseContent());
    assertEquals(TEST_OBJECT_AS_STRING_NO_VIEW, entry.getRequestContent());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .save(restAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
  }

  @Test
  public void testAroundLogRequestWithView() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithLoggedRequestWithView"));
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenReturn(response);

    final Object result = auditableRestEndpointAspect.around(proceedingJoinPoint);

    assertNotNull(result);
    assertSame(response, result);

    final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
    assertNotNull(entry);
    assertNull(entry.getResponseContent());
    assertEquals(TEST_OBJECT_AS_STRING, entry.getRequestContent());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .save(restAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
  }

  @Test
  public void testAroundLogResponse() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithLoggedResponse"));
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenReturn(response);

    final Object result = auditableRestEndpointAspect.around(proceedingJoinPoint);

    assertNotNull(result);
    assertSame(response, result);

    final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
    assertNotNull(entry);
    assertNull(entry.getRequestContent());
    assertEquals(TEST_OBJECT_AS_STRING_NO_VIEW, entry.getResponseContent());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .save(restAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
  }

  @Test
  public void testAroundLogResponseWithView() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithLoggedResponseWithView"));
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenReturn(response);

    final Object result = auditableRestEndpointAspect.around(proceedingJoinPoint);

    assertNotNull(result);
    assertSame(response, result);

    final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
    assertNotNull(entry);
    assertNull(entry.getRequestContent());
    assertEquals(TEST_OBJECT_AS_STRING, entry.getResponseContent());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .save(restAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.GenericObjectView.class);
  }

  @Test
  public void testAroundContainsUserPrincipal() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithNoLogging"));
    Mockito.when(requestWrapper.getUserPrincipal()).thenReturn(principal);
    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenReturn(response);

    final Object result = auditableRestEndpointAspect.around(proceedingJoinPoint);

    assertNotNull(result);
    assertSame(response, result);

    final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
    assertNotNull(entry);
    assertEquals(TEST_EMAIL, entry.getEmail());

    Mockito.verify(webAuditLogService, Mockito.times(1))
        .save(restAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
  }

  @Test(expected = Exception.class)
  public void testAroundLogException() throws Throwable {
    Mockito.when(methodSignature.getMethod())
        .thenReturn(AuditableTestClass.class.getMethod("methodWithNoLogging"));
    Mockito.when(webAuditLogService.save(restAuditLogEntryArgumentCaptor.capture()))
        .thenReturn(savedEntry);
    Mockito.when(proceedingJoinPoint.proceed()).thenThrow(Exception.class);

    try {
      auditableRestEndpointAspect.around(proceedingJoinPoint);
    } finally {
      final WebAuditLogEntry entry = restAuditLogEntryArgumentCaptor.getValue();
      assertNotNull(entry);
      assertNotNull(entry.getException());

      Mockito.verify(webAuditLogService, Mockito.times(1))
          .save(restAuditLogEntryArgumentCaptor.getValue());
      Mockito.verify(proceedingJoinPoint, Mockito.times(1)).proceed();
    }
  }

  private class AuditableTestClass {
    @AuditableRestEndpoint
    public void methodWithNoLogging() {}

    @AuditableRestEndpoint(logRequest = true)
    public void methodWithLoggedRequest() {}

    @AuditableRestEndpoint(logRequest = true, requestView = View.GenericObjectView.class)
    public void methodWithLoggedRequestWithView() {}

    @AuditableRestEndpoint(logResponse = true)
    public void methodWithLoggedResponse() {}

    @AuditableRestEndpoint(logResponse = true, responseView = View.GenericObjectView.class)
    public void methodWithLoggedResponseWithView() {}
  }
}
