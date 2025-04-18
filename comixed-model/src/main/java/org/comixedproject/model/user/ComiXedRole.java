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
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.comixedproject.views.View.UserList;

/**
 * A <code>ComiXedRole</code> defines the set of authorities a user has.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comixed_roles")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComiXedRole {
  public static final String ADMIN_ROLE = "ADMIN";
  public static final String READER_ROLE = "READER";

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "comixed_role_id")
  @JsonProperty("comixedRoleId")
  @JsonIgnore
  @Getter
  private Long comixedRoleId;

  @Column(name = "name", updatable = true, nullable = false, unique = true)
  @JsonView(UserList.class)
  @Getter
  @NonNull
  private String name;

  @ManyToMany(mappedBy = "roles")
  @JsonIgnore
  @Getter
  private List<ComiXedUser> users = new ArrayList<>();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComiXedRole role = (ComiXedRole) o;
    return Objects.equals(comixedRoleId, role.comixedRoleId) && Objects.equals(name, role.name);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comixedRoleId, name);
  }
}
