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

package org.comixed.library.model.comicvine;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonProperty;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Entity
@Table(name = "comic_vine_volume_query_cache")
public class ComicVineVolumeQueryCacheEntry
{
    // max age in days
    public static final long CACHE_TTL = 7L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @Column(name = "series_name")
    private String seriesName;

    @Column(name = "index")
    private int index;

    @Column(name = "created")
    private Date created = new Date();

    @Column(name = "content")
    @Lob
    @JsonProperty
    private String content;

    public ComicVineVolumeQueryCacheEntry()
    {}

    public String getContent()
    {
        return this.content;
    }

    public Date getCreated()
    {
        return this.created;
    }

    public Long getId()
    {
        return this.id;
    }

    public int getIndex()
    {
        return this.index;
    }

    public String getSeriesName()
    {
        return this.seriesName;
    }

    public void setContent(String content)
    {
        this.content = content;
    }

    public void setIndex(int index)
    {
        this.index = index;
    }

    public void setSeriesName(String seriesName)
    {
        this.seriesName = seriesName;
    }

    @Transient
    public long getAgeInDays()
    {
        long age = System.currentTimeMillis() - this.created.getTime();

        age = age / (1000 * 60 * 60 * 24);

        return age;
    }
}
