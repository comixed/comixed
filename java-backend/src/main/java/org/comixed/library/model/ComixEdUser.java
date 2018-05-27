/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonView;

@Entity
@Table(name = "users")
public class ComixEdUser
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(View.List.class)
    private Long id;

    @Column(name = "email",
            updatable = true,
            nullable = false,
            unique = true)
    private String email;

    @Column(name = "password_hash",
            updatable = true,
            nullable = false)
    private String passwordHash;

    @Column(name = "first_login_date",
            nullable = false,
            updatable = false)
    private Date firstLoginDate = new Date();

    @Column(name = "last_login_date",
            nullable = false,
            updatable = true)
    private Date lastLoginDate = new Date();

    @ManyToMany
    @JoinTable(name = "users_roles",
               joinColumns = @JoinColumn(name = "user_id",
                                         referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "role_id",
                                                referencedColumnName = "id"))
    private List<Role> roles = new ArrayList<>();

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

    public List<Role> getRoles()
    {
        return this.roles;
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
}
