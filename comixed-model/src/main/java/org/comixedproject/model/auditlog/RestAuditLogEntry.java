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

import java.util.Date;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * <code>RestAuditLogEntry</code> represents a single entry in the REST API audit log table.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "rest_audit_log")
public class RestAuditLogEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "remote_ip", nullable = false, updatable = false)
  @Getter
  @Setter
  private String remoteIp;

  @Column(name = "url", nullable = false, updatable = false)
  @Getter
  @Setter
  private String url;

  @Column(name = "method", nullable = false, updatable = false)
  @Getter
  @Setter
  private String method;

  @Column(name = "content", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  private String content;

  @Column(name = "email", nullable = true, updatable = false)
  @Getter
  @Setter
  private String emai;

  @Column(name = "start_time", nullable = false, updatable = false)
  @Getter
  @Setter
  private Date startTime = new Date();

  @Column(name = "end_time", nullable = false, updatable = false)
  @Getter
  @Setter
  private Date endTime = new Date();

  @Column(name = "successful", nullable = false, updatable = false)
  @Getter
  @Setter
  private Boolean successful;

  @Column(name = "exception", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  private String exception;
}