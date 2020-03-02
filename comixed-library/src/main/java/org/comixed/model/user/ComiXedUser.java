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

package org.comixed.model.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.*;
import org.comixed.model.library.Comic;
import org.comixed.views.View;

@Entity
@Table(name = "users")
public class ComiXedUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView(View.UserList.class)
  private Long id;

  @Column(name = "email", updatable = true, nullable = false, unique = true)
  @JsonView(View.UserList.class)
  private String email;

  @Transient @JsonIgnore private String password;

  @Column(name = "password_hash", updatable = true, nullable = false)
  private String passwordHash;

  @Column(name = "first_login_date", nullable = false, updatable = false)
  @JsonProperty("first_login_date")
  @JsonView(View.UserList.class)
  private Date firstLoginDate = new Date();

  @Column(name = "last_login_date", nullable = false, updatable = true)
  @JsonProperty("last_login_date")
  @JsonView(View.UserList.class)
  private Date lastLoginDate = new Date();

  @ManyToMany
  @JoinTable(
      name = "users_roles",
      joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
  @JsonView(View.UserList.class)
  private List<Role> roles = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JsonView(View.UserList.class)
  private List<Preference> preferences = new ArrayList<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  @JsonView(View.UserList.class)
  private List<Bookmark> bookmarks = new ArrayList<>();

  @Transient
  @JsonView(View.UserList.class)
  private boolean authenticated = false;

  public void addRole(Role role) {
    if (!this.roles.contains(role)) {
      this.roles.add(role);
    }
  }

  public String getEmail() {
    return this.email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Date getFirstLoginDate() {
    return this.firstLoginDate;
  }

  public Long getId() {
    return this.id;
  }

  public Date getLastLoginDate() {
    return this.lastLoginDate;
  }

  public void setLastLoginDate(Date lastLoginDate) {
    this.lastLoginDate = lastLoginDate;
  }

  public String getPasswordHash() {
    return this.passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  /**
   * Returns the user's preference with the given name.
   *
   * @param name the preference name
   * @return the value, or null if not found
   */
  public String getPreference(String name) {
    for (Preference preference : this.preferences) {
      if (preference.getName().equals(name)) return preference.getValue();
    }

    return null;
  }

  public List<Preference> getPreferences() {
    return this.preferences;
  }

  public List<Role> getRoles() {
    return this.roles;
  }

  public boolean isAuthenticated() {
    return this.authenticated;
  }

  public void setAuthenticated(boolean authenticated) {
    this.authenticated = authenticated;
  }

  /**
   * Sets the user preference for the given name.
   *
   * @param name the preference name
   * @param value the preference value
   */
  public void setProperty(String name, String value) {
    for (Preference preference : this.preferences) {
      if (preference.getName().equals(name)) {
        preference.setValue(value);
        return;
      }
    }
    this.preferences.add(new Preference(this, name, value));
  }

  public void clearRoles() {
    this.roles.clear();
  }

  public void deleteProperty(final String name) {
    this.preferences.remove(name);
  }

  public List<Bookmark> getBookmarks() {
    return this.bookmarks;
  }

  /**
   * Returns the user's mark with the given book.
   *
   * @param book the bookmark's book
   * @return the value, or null if none is set
   */
  public String getBookmark(Comic comic) {
    for (Bookmark bookmark : this.bookmarks) {
      if (bookmark.getComic().getId().equals(comic.getId())) return bookmark.getMark();
    }
    return null;
  }

  /**
   * Sets the user bookmark for the given book.
   *
   * @param comic the comic
   * @param mark the bookmark mark
   */
  public void setBookmark(Comic comic, String mark) {
    for (Bookmark bookmark : this.bookmarks) {
      if (bookmark.getComic() == comic) {
        bookmark.setMark(mark);
        return;
      }
    }
    this.bookmarks.add(new Bookmark(this, comic, mark));
  }

  public boolean isAdmin() {
    for (int index = 0; index < this.roles.size(); index++) {
      if (this.roles.get(index).getName().equals("ADMIN")) {
        return true;
      }
    }

    return false;
  }
}
