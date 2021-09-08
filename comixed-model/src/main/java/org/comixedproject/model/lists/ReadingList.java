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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;
import org.hibernate.annotations.ColumnTransformer;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

/**
 * <code>ReadingLists</code> represents a list of comics.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ReadingLists")
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
@NoArgsConstructor
public class ReadingList {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @Getter
  private Long id;

  @Column(name = "ReadingListState", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("readingListState")
  @JsonView({View.ComicListView.class, View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ReadingListState readingListState = ReadingListState.STABLE;

  @Column(name = "Name", length = 128)
  @ColumnTransformer(write = "(UPPER(?))")
  @JsonProperty("name")
  @JsonView({View.ComicListView.class, View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String name;

  @Column(name = "Summary", length = 256, nullable = true)
  @JsonProperty("summary")
  @JsonView({View.ComicListView.class, View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String summary;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "OwnerId")
  @JsonProperty("owner")
  @JsonView({View.ComicListView.class, View.ReadingLists.class})
  @Getter
  @Setter
  private ComiXedUser owner;

  @Column(name = "CreatedOn")
  @CreatedDate
  @JsonProperty("createdOn")
  @JsonView({View.ComicListView.class, View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @Getter
  @Setter
  private Date createdOn = new Date();

  @Column(name = "LastModifiedOn")
  @LastModifiedDate
  @JsonProperty("lastModifiedOn")
  @JsonView({
    View.ComicListView.class,
    View.ReadingListDetail.class,
    View.AuditLogEntryDetail.class
  })
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @ManyToMany
  @JoinTable(
      name = "ReadingListEntries",
      joinColumns = {@JoinColumn(name = "ReadingListId")},
      inverseJoinColumns = {@JoinColumn(name = "ComicId")})
  @JsonProperty("comics")
  @JsonView({View.ReadingLists.class, View.AuditLogEntryDetail.class})
  @Getter
  private List<Comic> comics = new ArrayList<>();

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ReadingList that = (ReadingList) o;
    return Objects.equals(id, that.id)
        && Objects.equals(readingListState, that.readingListState)
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
