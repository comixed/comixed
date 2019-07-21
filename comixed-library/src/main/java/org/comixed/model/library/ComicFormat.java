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
import javax.persistence.Table;

import org.comixed.views.View.ComicList;
import org.comixed.views.View.PageList;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonView;

@Component
@Entity
@Table(name = "comic_formats")
public class ComicFormat
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(
    {ComicList.class,
     PageList.class})
    private long id;

    @Column(name = "name",
            updatable = false,
            nullable = false)
    @JsonView(
    {ComicList.class,
     PageList.class})
    private String name;

    public long getId()
    {
        return this.id;
    }

    public String getName()
    {
        return this.name;
    }
}
