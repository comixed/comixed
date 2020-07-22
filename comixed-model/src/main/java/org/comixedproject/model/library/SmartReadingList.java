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

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;

/**
 * <code>SmartReadingList</code> represents a reading list of comics.
 *
 * @author João França
 */
@Entity
@Table(name = "smart_reading_lists")
public class SmartReadingList {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.SmartReadingList.class)
  @Getter
  private Long id;

  @Column(name = "name", length = 128)
  @JsonProperty("name")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private String name;

  @Column(name = "summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private String summary;

  @JsonProperty("owner")
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "owner_id")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private ComiXedUser owner;

  @Column(name = "created")
  @JsonProperty("created_date")
  @JsonView(View.SmartReadingList.class)
  private Date created = new Date();

  @Column(name = "negative")
  @JsonProperty("negative")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private boolean not = false;

  @Column(name = "mode")
  @JsonProperty("matcher_mode")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
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
  @Getter
  Set<Matcher> matchers = new HashSet<>();
}
