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

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.comic.Comic;

/**
 * <code>Task</code> represents a persisted worker task.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "tasks")
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "task_type", nullable = false, updatable = false)
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private TaskType taskType;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "comic_id", nullable = true, updatable = false)
  @Getter
  @Setter
  private Comic comic;

  @ElementCollection
  @CollectionTable(name = "task_properties")
  @MapKeyColumn(name = "name")
  @Column(name = "value")
  private Map<String, String> properties = new HashMap<>();

  @Column(name = "created", updatable = false, nullable = false)
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date created = new Date();

  /**
   * Sets a property on the task.
   *
   * @param name the property name
   * @param value the property value
   */
  public void setProperty(final String name, final String value) {
    this.properties.put(name, value);
  }

  /**
   * Retrieves a property on the task.
   *
   * @param name the property name
   * @return
   */
  public String getProperty(final String name) {
    return this.properties.get(name);
  }
}
