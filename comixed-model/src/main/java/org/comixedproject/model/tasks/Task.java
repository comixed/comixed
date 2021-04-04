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

import java.util.*;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import net.minidev.json.annotate.JsonIgnore;
import org.comixedproject.model.comic.Comic;
import org.springframework.data.annotation.CreatedDate;

/**
 * <code>Task</code> represents a persisted worker task.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Tasks")
public class Task {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "TaskType", nullable = false, updatable = false)
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private TaskType taskType;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "ComicId", nullable = true, updatable = false)
  @Getter
  @Setter
  private Comic comic;

  @OneToMany(
      mappedBy = "task",
      fetch = FetchType.EAGER,
      cascade = CascadeType.ALL,
      orphanRemoval = true)
  @JsonIgnore
  private Set<TaskProperty> properties = new HashSet<>();

  @Column(name = "CreatedOn", updatable = false, nullable = false)
  @CreatedDate
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  private Date created = new Date();

  /**
   * Sets a property on the task.
   *
   * @param name the property name
   * @param value the property value
   */
  public void setProperty(final String name, final String value) {
    this.properties.add(new TaskProperty(this, name, value));
  }

  /**
   * Retrieves a property on the task.
   *
   * @param name the property name
   * @return the property value
   */
  public String getProperty(final String name) {
    for (int index = 0; index < this.properties.size(); index++) {
      TaskProperty property = (TaskProperty) this.properties.toArray()[index];
      if (property.getName().equals(name)) return property.getValue();
    }

    return null;
  }
}
