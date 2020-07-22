/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.model.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View.UserList;

/**
 * <code>Preference</code> represents a single preference name and value for a single user.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "user_preferences")
public class Preference {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id")
  @JsonIgnore
  @Getter
  private ComiXedUser user;

  @Column(name = "name", nullable = false)
  @JsonView(UserList.class)
  @Getter
  private String name;

  @Column(name = "value", updatable = true, nullable = false)
  @JsonView(UserList.class)
  @Getter
  @Setter
  private String value;

  public Preference() {}

  public Preference(ComiXedUser user, String name, String value) {
    this.user = user;
    this.name = name;
    this.value = value;
  }
}
