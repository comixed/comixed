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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.model.library;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.views.View.ComicList;

@Entity
@Table(name = "comic_credits")
public class Credit
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(ComicList.class)
    private Long id;

    @Column(name = "name")
    @JsonProperty("name")
    @JsonView(ComicList.class)
    private String name;

    @Column(name = "role")
    @JsonProperty("role")
    @JsonView(ComicList.class)
    private String role;

    @ManyToOne
    @JoinColumn(name = "comic_id")
    @JsonIgnore
    private Comic comic;

    public Credit()
    {}

    public Credit(String name, String role)
    {
        this.name = name;
        this.role = role;
    }

    public Long getId()
    {
        return this.id;
    }

    public String getName()
    {
        return this.name;
    }

    public String getRole()
    {
        return this.role;
    }

    public void setComic(Comic comic)
    {
        this.comic = comic;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public void setRole(String role)
    {
        this.role = role;
    }
}
