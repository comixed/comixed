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

package org.comixedproject.model.comic;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import java.io.File;
import java.util.*;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.library.ReadingList;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.stereotype.Component;

/**
 * <code>Comic</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Entity
@Table(name = "Comics")
@Log4j2
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
public class Comic {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.ComicListView.class, View.LastReadList.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Long id;

  @Transient
  @JsonProperty("nextIssueId")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Long nextIssueId;

  @Transient
  @JsonProperty("previousIssueId")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Long previousIssueId;

  @Column(name = "Filename", nullable = false, unique = true, length = 1024)
  @JsonProperty("filename")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String filename;

  @Column(name = "ComicState", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("comicState")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ComicState comicState;

  @OneToOne(cascade = CascadeType.ALL, mappedBy = "comic", orphanRemoval = true)
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ComicFileDetails fileDetails;

  @Getter @Setter @Transient @JsonIgnore private File backingFile;

  @Column(name = "ArchiveType", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("archiveType")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ArchiveType archiveType;

  @Column(name = "Publisher", length = 128)
  @JsonProperty("publisher")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String publisher;

  @Column(name = "Series", length = 128)
  @JsonProperty("series")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String series;

  @Column(name = "Volume", length = 4)
  @JsonProperty("volume")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String volume;

  @Column(name = "IssueNumber", length = 16)
  @JsonProperty("issueNumber")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private String issueNumber;

  @Column(name = "Imprint")
  @JsonProperty("imprint")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String imprint;

  @Column(name = "Notes", length = 128, nullable = true, updatable = true)
  @JsonProperty("notes")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String notes;

  @OneToMany(mappedBy = "comic", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderColumn(name = "PageNumber")
  @JsonProperty("pages")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  List<Page> pages = new ArrayList<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderColumn(name = "FileNumber")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  private List<ComicFileEntry> fileEntries = new ArrayList<>();

  @ManyToOne
  @JoinColumn(name = "ScanTypeId")
  @JsonProperty("scanType")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ScanType scanType;

  @ManyToOne
  @JoinColumn(name = "FormatId")
  @JsonProperty("format")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private ComicFormat format;

  @Formula(value = "(SELECT COUNT(*) FROM Pages p WHERE p.ComicId = id)")
  @JsonIgnore
  @Transient
  private Integer calculatedPageCount;

  @Formula(value = "(SELECT COUNT(*) FROM Pages p where p.ComicId = id AND p.Deleted = true)")
  @JsonIgnore
  @Getter
  private Integer calculatedDeletedPageCount;

  @Column(name = "CreatedOn", updatable = false, nullable = false)
  @CreatedDate
  @JsonProperty("addedDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  private Date dateAdded = new Date();

  @Column(name = "DeletedOn", updatable = true, nullable = true)
  @JsonProperty("deletedDate")
  @JsonFormat(shape = Shape.NUMBER)
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date dateDeleted;

  @Column(name = "LastModifiedOn", updatable = true, nullable = false)
  @JsonProperty("lastModifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @Column(name = "ComicVineId", length = 16)
  @JsonProperty("comicVineId")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String comicVineId;

  @Column(name = "CoverDate", nullable = true)
  @Temporal(TemporalType.DATE)
  @JsonProperty("coverDate")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Date coverDate;

  @Column(name = "SortName", length = 128)
  @JsonProperty("sortName")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String sortName;

  @Column(name = "Title", length = 128)
  @JsonProperty("title")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String title;

  @Column(name = "Description")
  @Lob
  @JsonProperty("description")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String description;

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "Characters", joinColumns = @JoinColumn(name = "ComicId"))
  @Column(name = "Name")
  @JsonProperty("characters")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private List<String> characters = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "Teams", joinColumns = @JoinColumn(name = "ComicId"))
  @Column(name = "Name")
  @JsonProperty("teams")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private List<String> teams = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "Locations", joinColumns = @JoinColumn(name = "ComicId"))
  @Column(name = "Name")
  @JsonProperty("locations")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private List<String> locations = new ArrayList<>();

  @ElementCollection
  @LazyCollection(LazyCollectionOption.FALSE)
  @CollectionTable(name = "Stories", joinColumns = @JoinColumn(name = "ComicId"))
  @Column(name = "Name")
  @JsonProperty("storyArcs")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  List<String> storyArcs = new ArrayList<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("credits")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private Set<Credit> credits = new HashSet<>();

  @Formula(
      value =
          "(SELECT COUNT(*) FROM Pages p WHERE p.ComicId = id AND p.FileHash in (SELECT b.Hash FROM BlockedPages b))")
  @JsonProperty("blockedPageCount")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  @Getter
  private int blockedPageCount;

  @Transient
  @JsonProperty("comicVineURL")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private String comicVineURL;

  @Formula(
      "(SELECT COUNT(*) FROM Comics c WHERE c.Series = series AND c.Volume = volume AND c.IssueNumber = IssueNumber AND c.CoverDate = CoverDate)")
  @JsonProperty("duplicateCount")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  private Integer duplicateCount;

  @ManyToMany(
      mappedBy = "comics",
      cascade = {CascadeType.ALL})
  @JsonProperty("readingLists")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  private Set<ReadingList> readingLists = new HashSet<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.REMOVE, orphanRemoval = true)
  private List<PersistedTask> persistedTasks = new ArrayList<>();

  @OneToMany(mappedBy = "comic", cascade = CascadeType.REMOVE, orphanRemoval = true)
  @JsonIgnore
  @Getter
  private List<LastRead> lastReads = new ArrayList<>();

  /**
   * Adds a file entry, or replaces one if it already exists.
   *
   * @param name the entry filename
   * @param size the entry size
   * @param type the entry MIME type
   */
  public void addFileEntry(final String name, final int size, final String type) {
    int index = this.fileEntries.size();
    boolean replacement = false;
    for (int idx = 0; idx < this.fileEntries.size(); idx++) {
      if (this.fileEntries.get(idx).getFileName().equals(name)) {
        index = idx;
        replacement = true;
        break;
      }
    }

    if (replacement) {
      log.debug("Updating existing file entry: [{}] {}", index, name);
      final ComicFileEntry existing = fileEntries.get(index);
      existing.setFileSize(size);
      existing.setFileType(type);
    } else {
      log.debug("Adding new file entry: [{}] {}", index, name);
      final ComicFileEntry fileEntry = new ComicFileEntry();
      fileEntry.setFileName(name);
      fileEntry.setFileSize(size);
      fileEntry.setFileType(type);
      fileEntry.setFileNumber(index);
      this.fileEntries.add(fileEntry);
      fileEntry.setComic(this);
    }
  }

  /**
   * Deletes a offset from the comic.
   *
   * @param index the offset index
   */
  public void deletePage(int index) {
    log.debug("Deleting offset: index=" + index);
    final Page page = this.pages.get(index);
    this.pages.remove(index);
    page.setComic(null);
  }

  /**
   * Returns just the filename without the path.
   *
   * @return the filename
   */
  @JsonProperty("baseFilename")
  @JsonView({View.ComicDetailsView.class, View.AuditLogEntryDetail.class})
  public String getBaseFilename() {
    return FilenameUtils.getName(this.filename);
  }

  /**
   * Returns the cover {@link Page}.
   *
   * @return the cover, or <code>null</code> if the comic is empty
   */
  public Page getCover() {
    log.debug("Getting cover for comic: filename=" + this.filename);
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
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  public boolean isMissing() {
    if (this.backingFile == null) {
      this.backingFile = new File(this.filename);
    }

    return !this.backingFile.exists();
  }

  public int getIndexFor(Page page) {
    if (this.pages.contains(page)) return this.pages.indexOf(page);

    return -1;
  }

  @Transient
  @JsonProperty("sortableIssueNumber")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  public String getSortableIssueNumber() {
    final String result = "00000" + (this.issueNumber != null ? this.issueNumber : "");

    return result.substring(result.length() - 5);
  }

  /**
   * Sets the issue number for the comic.
   *
   * @param issueNumber the issue number
   */
  public void setIssueNumber(String issueNumber) {
    log.debug("Setting issue number=" + issueNumber);
    if ((issueNumber != null) && issueNumber.startsWith("0")) {
      log.debug("Removing leading 0s from issue number");
      while (issueNumber.startsWith("0") && !issueNumber.equals("0")) {
        issueNumber = issueNumber.substring(1);
      }
    }
    this.issueNumber = issueNumber;
  }

  /**
   * Returns the offset at the given index.
   *
   * @param index the offset index
   * @return the offset
   */
  public Page getPage(int index) {
    log.debug("Returning offset: index=" + index);
    return this.pages.get(index);
  }

  /**
   * Returns the number of pages associated with this comic.
   *
   * @return the offset count
   */
  @Transient
  @JsonProperty("pageCount")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  public int getPageCount() {
    if (!this.pages.isEmpty()) return this.pages.size();
    if (this.calculatedPageCount != null) return this.calculatedPageCount.intValue();
    return 0;
  }

  @Transient
  @JsonProperty(value = "publishedYear")
  @JsonView({View.ComicListView.class, View.AuditLogEntryDetail.class})
  public int getYearPublished() {
    if (this.coverDate != null) {
      GregorianCalendar calendar = new GregorianCalendar();
      calendar.setTime(this.coverDate);
      return calendar.get(Calendar.YEAR);
    }
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

  @Transient
  public File getFile() {
    return new File(this.filename);
  }

  public Integer getDuplicateCount() {
    return (this.duplicateCount != null) ? (this.duplicateCount - 1) : 0;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Comic comic = (Comic) o;
    return this.filename.equals(comic.getFilename());
  }

  @Override
  public int hashCode() {
    return 17 * Objects.hash(filename);
  }

  public void removeDeletedPages(final boolean deletePages) {
    log.debug("Remove deleted pages? {}", deletePages);
    if (deletePages) {
      Page[] pageArray = this.pages.toArray(new Page[this.pages.size()]);
      for (int index = 0; index < pageArray.length; index++) {
        Page page = pageArray[index];
        if (page.isDeleted() || page.isBlocked()) {
          log.debug("Removing page: filename={} hash={}", page.getFilename(), page.getHash());
          this.pages.remove(page);
          page.setComic(null);
        }
      }
    }
  }
}
