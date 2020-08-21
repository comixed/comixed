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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.comixedproject.views.View.UserList;

/**
 * A <code>Role</code> defines the set of authorities a user has.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "roles")
@NoArgsConstructor
public class Role {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonIgnore
  @Getter
  private Long id;

  @Column(name = "name", updatable = true, nullable = false, unique = true)
  @JsonView(UserList.class)
  @Getter
  private String name;

  @ManyToMany(mappedBy = "roles")
  @JsonIgnore
  @Getter
  private List<ComiXedUser> users = new ArrayList<>();

  public Role(final String name) {
    this.name = name;
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Role role = (Role) o;
    return Objects.equals(id, role.id) && Objects.equals(name, role.name);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, name);
  }
}
