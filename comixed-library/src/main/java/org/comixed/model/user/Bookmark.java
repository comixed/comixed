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
import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.views.View.UserList;

import javax.persistence.*;

@Entity
@Table(name = "user_bookmarks")
public class Bookmark
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private ComiXedUser user;

    @Column(name = "book",
            nullable = false)
    @JsonView(UserList.class)
    private long book;

    @Column(name = "mark",
            updatable = true,
            nullable = false)
    @JsonView(UserList.class)
    private String mark;

    public Bookmark()
    {}

    public Bookmark(ComiXedUser user, long book, String mark)
    {
        this.user = user;
        this.book = book;
        this.mark = mark;
    }

    public long getBook()
    {
        return book;
    }

    public void setBook(long book)
    {
        this.book = book;
    }

    public String getMark()
    {
        return mark;
    }

    public void setMark(String mark)
    {
        this.mark = mark;
    }

}
