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
import org.springframework.data.annotation.CreatedDate;

/**
 * <code>SmartReadingList</code> represents a reading list of comics.
 *
 * @author João França
 */
@Entity
@Table(name = "SmartReadingLists")
public class SmartReadingList {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.SmartReadingList.class)
  @Getter
  private Long id;

  @Column(name = "Name", length = 128)
  @JsonProperty("name")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private String name;

  @Column(name = "Summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private String summary;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "OwnerId")
  @JsonProperty("owner")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private ComiXedUser owner;

  @CreatedDate
  @Column(name = "CreatedOn")
  @JsonProperty("createdOne")
  @JsonView(View.SmartReadingList.class)
  private Date createdOn = new Date();

  @Column(name = "Negative")
  @JsonProperty("negative")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private boolean not = false;

  @Column(name = "MatchMode")
  @JsonProperty("matcher_mode")
  @JsonView(View.SmartReadingList.class)
  @Getter
  @Setter
  private String matcherMode;

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
  Set<SmartListMatcher> smartListMatchers = new HashSet<>();
}
