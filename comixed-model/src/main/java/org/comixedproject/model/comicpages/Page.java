/*
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

package org.comixedproject.model.comicpages;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;

/**
 * <code>Page</code> represents a single offset from a comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Pages")
@Log4j2
@NoArgsConstructor
@RequiredArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
public class Page {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComicId")
  @JsonProperty("comic")
  @Getter
  @Setter
  @NonNull
  private Comic comic;

  @Column(name = "PageState", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  @NonNull
  private PageState pageState = PageState.STABLE;

  @Column(name = "Filename", length = 1024, updatable = true, nullable = false)
  @JsonProperty("filename")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private String filename;

  @Column(name = "FileHash", length = 32, updatable = true, nullable = false)
  @JsonProperty("hash")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String hash;

  @Column(name = "PageNumber", nullable = false, updatable = true)
  @JsonProperty("pageNumber")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private Integer pageNumber;

  @Column(name = "Width", updatable = true)
  @JsonProperty("width")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Integer width = -1;

  @Column(name = "Height", updatable = true)
  @JsonProperty("height")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Integer height = -1;

  @Formula(
      "(SELECT CASE WHEN (FileHash IN (SELECT b.hash FROM BlockedPages b)) THEN true ELSE false END)")
  @JsonProperty("blocked")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  private boolean blocked;

  /**
   * Returns the offset's index within the comic.
   *
   * @return the offset index
   */
  @Transient
  @JsonProperty("index")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  public int getIndex() {
    return this.comic.getIndexFor(this);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Page page = (Page) o;
    return comic.equals(page.comic)
        && pageState == page.pageState
        && filename.equals(page.filename)
        && hash.equals(page.hash)
        && pageNumber.equals(page.pageNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comic, pageState, filename, hash, pageNumber);
  }

  @Transient
  @JsonProperty("deleted")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  public boolean isDeleted() {
    return PageState.DELETED.equals(this.pageState);
  }
}
