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

package org.comixedproject.model.lists;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import lombok.*;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;
import org.hibernate.annotations.ColumnTransformer;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

/**
 * <code>ReadingLists</code> represents a list of comicBooks.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "reading_lists")
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class ReadingList {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  private Long id;

  @Column(name = "reading_list_state", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("readingListState")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  @Setter
  private ReadingListState readingListState = ReadingListState.STABLE;

  @Column(name = "name_key", length = 128)
  @ColumnTransformer(write = "(UPPER(?))")
  @JsonIgnore
  @Getter
  private String nameKey;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "owner_id")
  @JsonProperty("owner")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  @Setter
  private ComiXedUser owner;

  @Column(name = "reading_list_name", length = 128)
  @JsonProperty("name")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  private String name;

  @Column(name = "summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  @Setter
  private String summary;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "reading_list_entries",
      joinColumns = {@JoinColumn(name = "reading_list_id")},
      inverseJoinColumns = {@JoinColumn(name = "comic_detail_id")})
  @JsonProperty("entries")
  @JsonView({View.ReadingLists.class})
  @Getter
  private List<ComicDetail> entries = new ArrayList<>();

  @Column(name = "created_on")
  @CreatedDate
  @JsonProperty("createdOn")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date createdOn = new Date();

  @Column(name = "last_modified_on")
  @LastModifiedDate
  @JsonProperty("lastModifiedOn")
  @JsonView({View.ComicListView.class, View.ReadingListDetail.class})
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  public void setName(final String name) {
    this.name = name;
    this.nameKey = name;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ReadingList that = (ReadingList) o;
    return Objects.equals(id, that.id)
        && Objects.equals(readingListState, that.readingListState)
        && Objects.equals(nameKey, that.nameKey)
        && Objects.equals(name, that.name)
        && Objects.equals(summary, that.summary)
        && Objects.equals(owner, that.owner)
        && Objects.equals(createdOn, that.createdOn)
        && Objects.equals(lastModifiedOn, that.lastModifiedOn);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, readingListState, name, summary, owner, createdOn, lastModifiedOn);
  }
}
