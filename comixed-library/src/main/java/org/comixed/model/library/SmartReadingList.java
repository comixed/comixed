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
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import org.comixed.model.user.ComiXedUser;
import org.comixed.views.View;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>SmartReadingList</code> represents a reading list of comics.
 *
 * @author João França
 */
@Entity
@Table(name = "smart_reading_lists")
public class SmartReadingList {
  @Transient @JsonIgnore private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.SmartReadingList.class)
  private Long id;

  @Column(name = "name", length = 128)
  @JsonProperty("name")
  @JsonView(View.SmartReadingList.class)
  private String name;

  @Column(name = "summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView(View.SmartReadingList.class)
  private String summary;

  @JsonProperty("owner")
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "owner_id")
  @JsonView(View.SmartReadingList.class)
  private ComiXedUser owner;

  @Column(name = "created")
  @JsonProperty("created_date")
  @JsonView(View.SmartReadingList.class)
  private Date created = new Date();

  @Column(name = "negative")
  @JsonProperty("negative")
  @JsonView(View.SmartReadingList.class)
  private boolean not = false;

  @Column(name = "mode")
  @JsonProperty("matcher_mode")
  @JsonView(View.SmartReadingList.class)
  private String mode;

  @OneToMany(
      mappedBy = "smartList",
      cascade = CascadeType.ALL,
      fetch = FetchType.EAGER,
      orphanRemoval = true)
  @OrderColumn(name = "id")
  @JsonProperty("matchers")
  @JsonView({
    View.SmartReadingList.class,
  })
  Set<Matcher> matchers = new HashSet<>();

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

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public boolean isNot() {
    return not;
  }

  public void setNot(boolean not) {
    this.not = not;
  }

  public String getMode() {
    return mode;
  }

  public void setMode(String mode) {
    this.mode = mode;
  }

  public Set<Matcher> getMatchers() {
    return this.matchers;
  }

  public void addMatcher(Matcher matcher) {
    matcher.setSmartList(this);
    this.matchers.add(matcher);
  }
}
