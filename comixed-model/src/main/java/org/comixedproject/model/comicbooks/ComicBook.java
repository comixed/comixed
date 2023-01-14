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

import com.fasterxml.jackson.annotation.*;
import java.io.File;
import java.util.*;
import javax.persistence.*;
import lombok.*;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

/**
 * <code>ComicBook</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicBooks")
@Log4j2
@NoArgsConstructor
@RequiredArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class ComicBook {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({
    View.ComicListView.class,
    View.LastReadList.class,
    View.DuplicatePageList.class,
    View.ReadingListDetail.class
  })
  @Getter
  @Setter
  private Long id;

  @Column(name = "Filename", nullable = false, unique = true, length = 1024)
  @JsonProperty("filename")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  @NonNull
  private String filename;

  @OneToOne(cascade = CascadeType.ALL, mappedBy = "comicBook", orphanRemoval = true)
  @JsonView({View.ComicListView.class, View.DuplicatePageList.class})
  @Getter
  @Setter
  private ComicFileDetails fileDetails;

  @OneToOne(mappedBy = "comicBook", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("detail")
  @JsonView({View.ComicDetailsView.class, View.ReadingListDetail.class})
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
  @OrderColumn(name = "PageNumber")
  @JsonProperty("pages")
  @JsonView({View.ComicListView.class, View.ReadingListDetail.class})
  @Getter
  List<Page> pages = new ArrayList<>();

  @Formula(
      value =
          "(SELECT COUNT(*) FROM Pages p WHERE p.ComicBookId = id AND p.FileHash in (SELECT b.Hash FROM BlockedHashes b))")
  @JsonProperty("blockedPageCount")
  @JsonView({View.ComicListView.class})
  @Getter
  private int blockedPageCount;

  @Column(name = "Title", length = 128)
  @JsonProperty("title")
  @JsonView({View.ComicListView.class, View.DuplicatePageList.class})
  @Getter
  @Setter
  private String title;

  @Column(name = "Notes", length = 128, nullable = true, updatable = true)
  @Lob
  @JsonProperty("notes")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String notes;

  @Column(name = "Description")
  @Lob
  @JsonProperty("description")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private String description;

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "CharacterTags", joinColumns = @JoinColumn(name = "ComicBookId"))
  @Column(name = "Name")
  @JsonProperty("characters")
  @JsonView({View.ComicListView.class})
  @Getter
  private List<String> characters = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "TeamTags", joinColumns = @JoinColumn(name = "ComicBookId"))
  @Column(name = "Name")
  @JsonProperty("teams")
  @JsonView({View.ComicListView.class})
  @Getter
  private List<String> teams = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "LocationTags", joinColumns = @JoinColumn(name = "ComicBookId"))
  @Column(name = "Name")
  @JsonProperty("locations")
  @JsonView({View.ComicListView.class})
  @Getter
  private List<String> locations = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "StoryTags", joinColumns = @JoinColumn(name = "ComicBookId"))
  @Column(name = "Name")
  @JsonProperty("stories")
  @JsonView({View.ComicListView.class})
  @Getter
  List<String> stories = new ArrayList<>();

  @OneToMany(mappedBy = "comicBook", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("credits")
  @JsonView({View.ComicListView.class})
  @Getter
  private Set<Credit> credits = new HashSet<>();

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

  @Column(name = "CreateMetadataSource", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean createMetadataSource = false;

  @Column(name = "FileContentsLoaded", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean fileContentsLoaded = false;

  @Column(name = "BlockedPagesMarked", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean blockedPagesMarked = false;

  @Column(name = "UpdateMetadata", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean updateMetadata = false;

  @Column(name = "BatchMetadataUpdate", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean batchMetadataUpdate = false;

  @Column(name = "Consolidating", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean consolidating = false;

  @Column(name = "Recreating", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean recreating = false;

  @Column(name = "EditDetails", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean editDetails = false;

  @Column(name = "PurgeComic", nullable = false, updatable = true)
  @JsonIgnore
  @Getter
  @Setter
  private boolean purgeComic;

  @Column(name = "LastModifiedOn", updatable = true, nullable = false)
  @JsonProperty("lastModifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.ComicListView.class})
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @Transient @Getter @Setter private String metadataSourceName;
  @Transient @Getter @Setter private String metadataReferenceId;

  @Column(name = "SortName", length = 128)
  @JsonProperty("sortName")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String sortName;

  @ManyToMany(
      mappedBy = "comicBooks",
      cascade = {CascadeType.ALL})
  @JsonProperty("readingLists")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private Set<ReadingList> readingLists = new HashSet<>();

  @OneToMany(mappedBy = "comicBook", cascade = CascadeType.REMOVE, orphanRemoval = true)
  @JsonIgnore
  @Getter
  private List<LastRead> lastReads = new ArrayList<>();

  /**
   * Returns just the filename without the path.
   *
   * @return the filename
   */
  @JsonProperty("baseFilename")
  @JsonView({View.ComicDetailsView.class})
  public String getBaseFilename() {
    return FilenameUtils.getName(this.filename);
  }

  /**
   * Returns the cover {@link Page}.
   *
   * @return the cover, or <code>null</code> if the comic is empty
   */
  public Page getCover() {
    log.trace("Getting cover for comic: filename=" + this.filename);
    /*
     * if there are no pages or the underlying file is missing then show the
     * missing
     * offset image
     */
    return this.pages.isEmpty() || this.isMissing() ? null : this.pages.get(0);
  }

  /**
   * Reports if the underlying comic file is missing.
   *
   * @return <code>true</code> if the file is missing
   */
  @JsonProperty("missing")
  @JsonView({View.ComicListView.class})
  public boolean isMissing() {
    return !this.getFile().exists();
  }

  @Transient
  public File getFile() {
    return new File(this.filename);
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
  public int hashCode() {
    return Objects.hash(filename);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicBook comicBook = (ComicBook) o;
    return filename.equals(comicBook.filename);
  }
}
