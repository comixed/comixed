/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import java.io.File;
import java.util.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;

/**
 * <code>ComicDetail</code> contains the searchable details for a {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_details")
@NoArgsConstructor
@RequiredArgsConstructor
@Log4j2
public class ComicDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({
    View.ComicListView.class,
    View.DeletedPageList.class,
    View.LastReadList.class,
    View.ReadingListDetail.class,
    View.DuplicatePageList.class
  })
  @Getter
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "comic_book_id", nullable = false, updatable = false)
  @NonNull
  @Getter
  @Setter
  private ComicBook comicBook;

  @Formula(
      "(SELECT CASE WHEN (comic_book_id IN (SELECT m.comic_book_id FROM comic_metadata_sources m)) THEN false ELSE true END)")
  @JsonProperty("unscraped")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private Boolean unscraped;

  @Column(name = "filename", nullable = false, unique = true, length = 1024)
  @JsonProperty("filename")
  @JsonView({View.ComicListView.class, View.DeletedPageList.class})
  @Getter
  @Setter
  @NonNull
  private String filename;

  @Column(name = "archive_type", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("archiveType")
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  @NonNull
  private ArchiveType archiveType;

  @Column(name = "comic_state", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("comicState")
  @JsonView({
    View.ComicListView.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private ComicState comicState = ComicState.CREATED;

  @Column(name = "comic_type", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonProperty("comicType")
  @JsonView({
    View.ComicListView.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private ComicType comicType = ComicType.ISSUE;

  @Column(name = "publisher", length = 255)
  @JsonProperty("publisher")
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private String publisher;

  @Column(name = "imprint", length = 255)
  @JsonProperty("imprint")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String imprint;

  @Column(name = "series", length = 255)
  @JsonProperty("series")
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private String series;

  @Column(name = "volume", length = 4)
  @JsonProperty("volume")
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private String volume;

  @Column(name = "issue_number", length = 16)
  @JsonProperty("issueNumber")
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  private String issueNumber;

  @JsonProperty("sortableIssueNumber")
  @JsonView({View.ComicListView.class})
  @Formula("(issue_number)")
  @Getter
  private String sortableIssueNumber;

  @JsonProperty("pageCount")
  @JsonView({
    View.ComicListView.class,
  })
  @Formula("(SELECT COUNT(*) FROM comic_pages p WHERE p.comic_book_id = comic_book_id)")
  @Getter
  private Integer pageCount;

  @Column(name = "sort_name", length = 128)
  @JsonProperty("sortName")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String sortName;

  @Column(name = "title", length = 128)
  @JsonProperty("title")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String title;

  @Column(name = "notes", length = 128, nullable = true, updatable = true)
  @Lob
  @JsonProperty("notes")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String notes;

  @Column(name = "description")
  @Lob
  @JsonProperty("description")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private String description;

  @OneToMany(
      mappedBy = "comicDetail",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @JsonProperty("tags")
  @JsonView({View.ComicListView.class, View.ReadingListDetail.class})
  @Getter
  private Set<ComicTag> tags = new HashSet<>();

  @Column(name = "cover_date", nullable = true)
  @Temporal(TemporalType.DATE)
  @JsonProperty("coverDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  @Getter
  @Setter
  private Date coverDate;

  @Formula("(SELECT CASE WHEN cover_date IS NULL THEN 0 ELSE YEAR(cover_date) END)")
  @JsonProperty("yearPublished")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private Integer yearPublished;

  @Formula("(SELECT CASE WHEN cover_date IS NULL THEN 0 ELSE MONTH(cover_date) END)")
  @JsonProperty("monthPublished")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private Integer monthPublished;

  @Column(name = "store_date", nullable = true)
  @Temporal(TemporalType.DATE)
  @JsonProperty("storeDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView({View.ComicListView.class, View.ReadingListDetail.class, View.DeletedPageList.class})
  @Getter
  @Setter
  private Date storeDate;

  @Column(name = "added_date", updatable = false, nullable = false)
  @CreatedDate
  @JsonProperty("addedDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView({
    View.ComicListView.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class
  })
  @Temporal(TemporalType.TIMESTAMP)
  @Getter
  @Setter
  private Date addedDate = new Date();

  @OneToMany(mappedBy = "comicDetail", orphanRemoval = true)
  @Getter
  private final List<LastRead> lastReadList = new ArrayList<>();

  /**
   * Returns the id for the parent comic book.
   *
   * @return the comic book id
   */
  @JsonProperty("comicId")
  @JsonView({
    View.ComicListView.class,
    View.LastReadList.class,
    View.DuplicatePageDetail.class,
    View.ReadingListDetail.class,
    View.DeletedPageList.class,
    View.DuplicatePageList.class
  })
  public Long getComicId() {
    return this.comicBook.getId();
  }

  /**
   * Returns just the filename without the path.
   *
   * @return the filename
   */
  @JsonProperty("baseFilename")
  @JsonView({View.ComicListView.class})
  public String getBaseFilename() {
    return FilenameUtils.getName(this.filename);
  }

  /**
   * Returns a file reference to the comic.
   *
   * @return the file
   */
  @Transient
  public File getFile() {
    return new File(this.filename);
  }

  /**
   * Returns if the comic file is missing.
   *
   * @return true if the file was not found
   */
  @Transient
  @JsonProperty("missing")
  @JsonView({View.ComicDetailsView.class})
  public boolean isMissing() {
    final File file = this.getFile();
    return !(file.exists() && file.isFile());
  }

  /**
   * Sets the issue number for the comic.
   *
   * @param issueNumber the issue number
   */
  public void setIssueNumber(String issueNumber) {
    log.trace("Setting issue number=" + issueNumber);
    if ((issueNumber != null) && issueNumber.startsWith("0")) {
      log.trace("Removing leading 0s from issue number");
      while (issueNumber.startsWith("0") && !issueNumber.equals("0")) {
        issueNumber = issueNumber.substring(1);
      }
    }
    this.issueNumber = issueNumber;
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicDetail that = (ComicDetail) o;
    return filename.equals(that.filename)
        && archiveType == that.archiveType
        && comicState == that.comicState
        && comicType == that.comicType
        && Objects.equals(publisher, that.publisher)
        && Objects.equals(imprint, that.imprint)
        && Objects.equals(series, that.series)
        && Objects.equals(volume, that.volume)
        && Objects.equals(issueNumber, that.issueNumber)
        && Objects.equals(sortName, that.sortName)
        && Objects.equals(title, that.title)
        && Objects.equals(notes, that.notes)
        && Objects.equals(description, that.description)
        && Objects.equals(tags, that.tags)
        && Objects.equals(coverDate, that.coverDate)
        && Objects.equals(storeDate, that.storeDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        filename,
        archiveType,
        comicState,
        comicType,
        publisher,
        imprint,
        series,
        volume,
        issueNumber,
        sortName,
        title,
        notes,
        description,
        tags,
        coverDate,
        storeDate);
  }
}
