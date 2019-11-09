/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixed.model.library;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import java.util.Date;

/**
 * <code>ReadingListEntry</code> represents a single entry in a {@link ReadingList}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "reading_list_entries")
public class ReadingListEntry {
  @Transient @JsonIgnore private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.ReadingList.class)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "reading_list_id")
  @JsonIgnore
  @JsonView(View.ReadingList.class)
  private ReadingList readingList;

  @ManyToOne
  @JoinColumn(name = "comic_id")
  @JsonProperty("comic")
  @JsonView(View.ReadingList.class)
  private Comic comic;

  @Column(name = "added")
  @JsonProperty("added_date")
  @JsonView(View.ReadingList.class)
  private Date added = new Date();

  public ReadingListEntry() {
    this(null, null);
  }

  public ReadingListEntry(Comic comic, ReadingList readingList) {
    this.comic = comic;
    this.readingList = readingList;
  }

  public Long getId() {
    return id;
  }

  public ReadingList getReadingList() {
    return readingList;
  }

  public void setReadingList(ReadingList readingList) {
    this.readingList = readingList;
  }

  public Comic getComic() {
    return comic;
  }

  public void setComic(Comic comic) {
    this.comic = comic;
  }
}
