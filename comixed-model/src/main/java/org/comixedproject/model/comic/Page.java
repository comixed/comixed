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

package org.comixedproject.model.comic;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.views.View.ComicList;
import org.comixedproject.views.View.DatabaseBackup;
import org.comixedproject.views.View.DuplicatePageList;
import org.comixedproject.views.View.PageList;
import org.hibernate.annotations.Formula;

/**
 * <code>Page</code> represents a single offset from a comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "pages")
@Log4j2
public class Page {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({ComicList.class, PageList.class, DuplicatePageList.class, DatabaseBackup.class})
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "comic_id")
  @JsonView({PageList.class, DuplicatePageList.class})
  @Getter
  @Setter
  private Comic comic;

  @ManyToOne
  @JoinColumn(name = "type_id", nullable = false)
  @JsonProperty("page_type")
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private PageType pageType;

  @Column(name = "filename", length = 128, updatable = true, nullable = false)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private String filename;

  @Column(name = "hash", length = 32, updatable = true, nullable = false)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private String hash;

  @Column(name = "page_number", nullable = false, updatable = true)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private Integer pageNumber;

  @Column(name = "deleted", updatable = true, nullable = false)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class, DuplicatePageList.class})
  @Getter
  @Setter
  private boolean deleted = false;

  @Column(name = "width", updatable = true)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private Integer width = -1;

  @Column(name = "height", updatable = true)
  @JsonView({ComicList.class, PageList.class, DatabaseBackup.class})
  @Getter
  @Setter
  private Integer height = -1;

  @Formula(
      "(SELECT CASE WHEN (hash IN (SELECT bph.hash FROM blocked_page_hashes bph)) THEN true ELSE false END)")
  @JsonView({ComicList.class, PageList.class, DuplicatePageList.class, DatabaseBackup.class})
  @Getter
  private boolean blocked;

  @Transient @Getter @Setter private byte[] content;

  /** Default constructor. */
  public Page() {}

  /**
   * Creates a new instance with the given filename and image content.
   *
   * @param filename the filename
   * @param content the content
   * @param pageType the offset type
   */
  public Page(
      String filename,
      PageType pageType,
      final String hash,
      final Integer width,
      final Integer height) {
    this.filename = filename;
    this.pageType = pageType;
    this.hash = hash;
    this.width = width;
    this.height = height;
  }

  @JsonProperty(value = "comic_id")
  @JsonView(PageList.class)
  public Long getComicId() {
    return this.comic != null ? this.comic.getId() : null;
  }

  /**
   * Returns the offset's index within the comic.
   *
   * @return the offset index
   */
  @Transient
  @JsonView({ComicList.class, PageList.class})
  @JsonProperty(value = "index")
  public int getIndex() {
    return this.comic.getIndexFor(this);
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = (prime * result) + ((this.filename == null) ? 0 : this.filename.hashCode());
    result = (prime * result) + ((this.hash == null) ? 0 : this.hash.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null) return false;
    if (this.getClass() != obj.getClass()) return false;
    Page other = (Page) obj;
    if (this.filename == null) {
      if (other.filename != null) return false;
    } else if (!this.filename.equals(other.filename)) return false;
    if (this.hash == null) {
      if (other.hash != null) return false;
    } else if (!this.hash.equals(other.hash)) return false;
    return true;
  }
}
