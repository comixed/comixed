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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.views.View;

/**
 * <code>AuditEvent</code> represents a single auditing event.
 *
 * @param <T> the audited type
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class AuditEvent<T> {
  @JsonProperty("value")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @NonNull
  private T value;

  @JsonProperty("eventType")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  @NonNull
  private AuditEventType eventType;

  @JsonProperty("occurred")
  @JsonView(View.SessionUpdateView.class)
  @Getter
  private Date occurred = new Date();
}
