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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.library.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

@Entity
@Table(name = "users")
public class ComiXedUser
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(View.List.class)
    private Long id;

    @Column(name = "email",
            updatable = true,
            nullable = false,
            unique = true)
    @JsonView(View.List.class)
    private String email;

    @Column(name = "password_hash",
            updatable = true,
            nullable = false)
    private String passwordHash;

    @Column(name = "first_login_date",
            nullable = false,
            updatable = false)
    @JsonProperty("first_login_date")
    @JsonView(View.Details.class)
    private Date firstLoginDate = new Date();

    @Column(name = "last_login_date",
            nullable = false,
            updatable = true)
    @JsonProperty("last_login_date")
    @JsonView(View.List.class)
    private Date lastLoginDate = new Date();

    @ManyToMany
    @JoinTable(name = "users_roles",
               joinColumns = @JoinColumn(name = "user_id",
                                         referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "role_id",
                                                referencedColumnName = "id"))
    @JsonView(View.Details.class)
    private List<Role> roles = new ArrayList<>();

    @OneToMany(mappedBy = "user",
               cascade = CascadeType.ALL,
               fetch = FetchType.EAGER)
    @JsonView(View.Details.class)
    private List<Preference> preferences = new ArrayList<>();

    @Transient
    @JsonView(View.Details.class)
    private boolean authenticated = false;

    public String getEmail()
    {
        return this.email;
    }

    public Date getFirstLoginDate()
    {
        return this.firstLoginDate;
    }

    public Long getId()
    {
        return this.id;
    }

    public Date getLastLoginDate()
    {
        return this.lastLoginDate;
    }

    public String getPasswordHash()
    {
        return this.passwordHash;
    }

    /**
     * Returns the user's preference with the given name.
     *
     * @param name
     *            the preference name
     * @return the value, or null if not found
     */
    public String getPreference(String name)
    {
        for (Preference preference : this.preferences)
        {
            if (preference.getName().equals(name)) return preference.getValue();
        }

        return null;
    }

    public List<Role> getRoles()
    {
        return this.roles;
    }

    public boolean isAuthenticated()
    {
        return this.authenticated;
    }

    public void setAuthenticated(boolean authenticated)
    {
        this.authenticated = authenticated;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public void setLastLoginDate(Date lastLoginDate)
    {
        this.lastLoginDate = lastLoginDate;
    }

    public void setPasswordHash(String passwordHash)
    {
        this.passwordHash = passwordHash;
    }

    /**
     * Sets the user preference for the given name.
     *
     * @param name
     *            the preference name
     * @param value
     *            the preference value
     */
    public void setProperty(String name, String value)
    {
        for (Preference preference : this.preferences)
        {
            if (preference.getName().equals(name))
            {
                preference.setValue(value);
                return;
            }
        }
        this.preferences.add(new Preference(this, name, value));
    }
}
