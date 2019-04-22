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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.library.lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.comixed.library.model.ComiXedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.*;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * <code>ReadingList</code> represents a reading list of comics.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "reading_lists")
public class ReadingList {
  @Transient @JsonIgnore private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @JsonProperty("entries")
  @OneToMany(
      mappedBy = "readingList",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  Set<ReadingListEntry> entries = new HashSet<>();

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  private Long id;

  @Column(name = "name", length = 128)
  @JsonProperty("name")
  private String name;

  @Column(name = "summary", length = 256, nullable = true)
  @JsonProperty("summary")
  private String summary;

  @JsonProperty("owner")
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "owner_id")
  private ComiXedUser owner;

  @Column(name = "created")
  @JsonProperty("created_date")
  private Date created = new Date();

  public Long getId() {
    return this.id;
  }

  public String getName() {
    return this.name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public ComiXedUser getOwner() {
    return this.owner;
  }

  public void setOwner(ComiXedUser owner) {
    this.owner = owner;
  }

  public Set<ReadingListEntry> getEntries() {
    return this.entries;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }
}
