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

package org.comixedproject.model.tasks;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>TaskAuditLogEntry</code> represents a single entry in the task audit log table.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "task_audit_log")
public class TaskAuditLogEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  @Setter
  private Long id;

  @Column(name = "start_time", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonProperty("startTime")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView(View.AuditLogEntryList.class)
  private Date startTime = new Date();

  @Column(name = "end_time", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonProperty("endTime")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView(View.AuditLogEntryList.class)
  private Date endTime = new Date();

  @Column(name = "successful", nullable = false, updatable = false)
  @Getter
  @Setter
  @JsonProperty("successful")
  @JsonView(View.AuditLogEntryList.class)
  private Boolean successful;

  @Column(name = "description", nullable = false, updatable = false, length = 2048)
  @Getter
  @Setter
  @JsonProperty("description")
  @JsonView(View.AuditLogEntryList.class)
  private String description;

  @Column(name = "exception", nullable = true, updatable = false)
  @Lob
  @Getter
  @Setter
  @JsonProperty("exception")
  @JsonView(View.AuditLogEntryList.class)
  private String exception;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final TaskAuditLogEntry that = (TaskAuditLogEntry) o;
    return id.equals(that.id)
        && startTime.equals(that.startTime)
        && endTime.equals(that.endTime)
        && successful.equals(that.successful)
        && description.equals(that.description);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, startTime, endTime, successful, description);
  }
}
