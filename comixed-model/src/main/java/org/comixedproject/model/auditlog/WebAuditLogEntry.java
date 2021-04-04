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

package org.comixedproject.model.auditlog;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>WebAuditLogEntry</code> represents a single entry in the REST API audit log table.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "WebAuditLogEntries")
public class WebAuditLogEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  @JsonView(View.AuditLogEntryList.class)
  private Long id;

  @Column(name = "RemoteIp", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String remoteIp;

  @Column(name = "URL", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String url;

  @Column(name = "Method", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String method;

  @Column(name = "RequestContent", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String requestContent;

  @Column(name = "ResponseContent", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String responseContent;

  @Column(name = "Email", nullable = true, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String email;

  @Column(name = "StartTime", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Date startTime = new Date();

  @Column(name = "EndTime", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Date endTime = new Date();

  @Column(name = "Successful", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private Boolean successful;

  @Column(name = "Exception", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  @JsonView(View.AuditLogEntryList.class)
  private String exception;
}
