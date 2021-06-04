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

package org.comixedproject.model.comic;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * A <code>ScanType</code> represents the type of source media was used to create the comic. For
 * example, a comic may be a scan of a previous printed comic, or it might be an originally digital
 * comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Entity
@Table(name = "ScanTypes")
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
@NoArgsConstructor
public class ScanType {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.ScanTypeList.class, View.AuditLogEntryDetail.class})
  @Getter
  private long id;

  @Column(name = "Name", updatable = false, nullable = false)
  @JsonView({View.ScanTypeList.class, View.AuditLogEntryDetail.class})
  @Getter
  private String name;
}
