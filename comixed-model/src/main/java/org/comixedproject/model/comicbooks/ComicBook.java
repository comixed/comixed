/*
 * ComiXed - A digital comic book library management application.
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

package org.comixedproject.model.comicbooks;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.util.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;

/**
 * <code>ComicBook</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_books")
@Log4j2
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class ComicBook {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.DuplicatePageList.class, View.ReadingListDetail.class})
  @Getter
  @Setter
  private Long id;

  @OneToOne(mappedBy = "comicBook", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("detail")
  @JsonView({View.ComicListView.class, View.ComicDetailsView.class, View.ReadingListDetail.class})
  @Getter
  @Setter
  private ComicDetail comicDetail;

  @OneToOne(mappedBy = "comicBook", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("metadata")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private ComicMetadataSource metadata;

  @OneToMany(mappedBy = "comicBook", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderColumn(name = "page_number")
  @JsonProperty("pages")
  @JsonView({View.ComicListView.class, View.ReadingListDetail.class})
  @Getter
  List<Page> pages = new ArrayList<>();

  @Formula(
      "(SELECT COUNT(*) FROM comic_pages p WHERE p.comic_book_id = id AND p.file_hash IN (SELECT d.file_hash FROM comic_pages d GROUP BY d.file_hash HAVING COUNT(*) > 1))")
  @JsonProperty("duplicatePageCount")
  @JsonView({View.ComicListView.class})
  @Getter
  private int duplicatePageCount;

  @Formula(
      value =
          "(SELECT COUNT(*) FROM comic_pages p WHERE p.comic_book_id = id AND p.file_hash in (SELECT b.hash_value FROM blocked_hashes b))")
  @JsonProperty("blockedPageCount")
  @JsonView({View.ComicListView.class})
  @Getter
  private int blockedPageCount;

  @Transient
  @JsonProperty("nextIssueId")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Long nextIssueId;

  @Transient
  @JsonProperty("previousIssueId")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Long previousIssueId;

  @Column(name = "create_metadata_source", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean createMetadataSource = false;

  @Column(name = "file_contents_loaded", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean fileContentsLoaded = false;

  @Column(name = "blocked_pages_marked", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean blockedPagesMarked = false;

  @Column(name = "update_metadata", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean updateMetadata = false;

  @Column(name = "batch_metadata_update", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean batchMetadataUpdate = false;

  @Column(name = "consolidating", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean consolidating = false;

  @Column(name = "recreating", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean recreating = false;

  @Column(name = "edit_details", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean editDetails = false;

  @Column(name = "purge_comic", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean purgeComic;

  @Column(name = "last_modified_on", updatable = true, nullable = false)
  @JsonProperty("lastModifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView({View.ComicListView.class})
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @Transient @Getter @Setter private String metadataSourceName;
  @Transient @Getter @Setter private String metadataReferenceId;

  /**
   * Reports if the underlying comic file is missing.
   *
   * @return <code>true</code> if the file is missing
   */
  @JsonProperty("missing")
  @JsonView({View.ComicListView.class})
  public boolean isMissing() {
    return !this.getComicDetail().getFile().exists();
  }

  public int getIndexFor(Page page) {
    if (this.pages.contains(page)) return this.pages.indexOf(page);

    return -1;
  }

  /**
   * Returns the offset at the given index.
   *
   * @param index the offset index
   * @return the offset
   * @deprecated use #getPages() instead
   */
  @Deprecated
  public Page getPage(int index) {
    log.trace("Returning offset: index=" + index);
    return this.pages.get(index);
  }

  /**
   * Returns the number of pages associated with this comic.
   *
   * @return the offset count
   */
  @Transient
  @JsonProperty("pageCount")
  @JsonView({View.ComicListView.class})
  public int getPageCount() {
    if (!this.pages.isEmpty()) return this.pages.size();
    return 0;
  }

  /**
   * Returns whether a offset with the given filename is present.
   *
   * @param filename the filename
   * @return true if such a offset exists
   */
  public boolean hasPageWithFilename(String filename) {
    return this.getPageWithFilename(filename) != null;
  }

  /**
   * Returns the offset for the given filename.
   *
   * @param filename the filename
   * @return the {@link Page} or null
   */
  public Page getPageWithFilename(String filename) {
    if (this.pages.isEmpty()) return null;
    for (Page page : this.pages) {
      if (page.getFilename().equals(filename)) return page;
    }

    return null;
  }

  public void sortPages() {
    this.pages.sort((Page p1, Page p2) -> p1.getFilename().compareTo(p2.getFilename()));
    for (int index = 0; index < this.pages.size(); index++) {
      this.pages.get(index).setPageNumber(index);
    }
  }

  /** Removes pages that are marked for deletion. */
  public void removeDeletedPages() {
    List<Page> pages = new ArrayList<>(this.pages);
    pages.forEach(
        page -> {
          if (page.getPageState() == PageState.DELETED) {
            log.trace("Removing page: {}", page.getId());
            this.pages.remove(page);
          }
        });
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ComicBook comicBook = (ComicBook) o;
    return Objects.equals(comicDetail, comicBook.comicDetail);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comicDetail);
  }
}
