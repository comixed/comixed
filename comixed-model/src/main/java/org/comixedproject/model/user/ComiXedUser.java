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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>ComiXedUser</code> represents a single login account for the application.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comixed_users")
public class ComiXedUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView(View.UserList.class)
  @Getter
  private Long id;

  @Column(name = "email", updatable = true, nullable = false, unique = true)
  @JsonView(View.UserList.class)
  @Getter
  @Setter
  private String email;

  @Transient @JsonIgnore private String password;

  @Column(name = "password_hash", updatable = true, nullable = false)
  @Getter
  @Setter
  private String passwordHash;

  @Column(name = "created_on", nullable = false, updatable = false)
  @JsonProperty("first_login_date")
  @JsonView(View.UserList.class)
  @Getter
  private Date firstLoginDate = new Date();

  @Column(name = "last_logged_on", nullable = false, updatable = true)
  @JsonProperty("last_login_date")
  @JsonView(View.UserList.class)
  @Getter
  @Setter
  private Date lastLoginDate = new Date();

  @ManyToMany
  @JoinTable(
      name = "comixed_user_roles",
      joinColumns = @JoinColumn(name = "comixed_user_id"),
      inverseJoinColumns = @JoinColumn(name = "comixed_role_id"))
  @JsonView(View.UserList.class)
  @Getter
  private List<ComiXedRole> roles = new ArrayList<>();

  @OneToMany(
      mappedBy = "user",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @JsonView(View.UserList.class)
  @Getter
  private List<ComiXedUserPreference> preferences = new ArrayList<>();

  @Transient
  @JsonView(View.UserList.class)
  @Getter
  @Setter
  private boolean authenticated = false;

  /**
   * Assigns the given role to the user's account.
   *
   * @param role the role
   */
  public void addRole(ComiXedRole role) {
    if (!this.roles.contains(role)) {
      this.roles.add(role);
    }
  }

  /**
   * Sets the user preference for the user.
   *
   * @param name the preference name
   * @param value the preference value
   */
  public void setProperty(String name, String value) {
    for (ComiXedUserPreference preference : this.preferences) {
      if (preference.getName().equals(name)) {
        preference.setValue(value);
        return;
      }
    }
    final ComiXedUserPreference preference = new ComiXedUserPreference(name);
    preference.setUser(this);
    preference.setValue(value);
    this.preferences.add(preference);
  }

  /**
   * Deletes the named preference for the user.
   *
   * @param name the preference name
   */
  public void deleteProperty(final String name) {
    ComiXedUserPreference preference = null;
    int index = -1;
    for (int which = 0; which < this.preferences.size(); which++) {
      if (this.preferences.get(which).getName().equals(name)) {
        preference = this.preferences.get(which);
        index = which;
        break;
      }
    }
    if (preference != null) {
      preference.setUser(null);
      this.preferences.remove(index);
    }
  }

  /** Clears all roles assigned to the user. */
  public void clearRoles() {
    this.roles.clear();
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComiXedUser that = (ComiXedUser) o;
    return Objects.equals(email, that.email);
  }

  @Override
  public int hashCode() {
    return Objects.hash(email);
  }
}
