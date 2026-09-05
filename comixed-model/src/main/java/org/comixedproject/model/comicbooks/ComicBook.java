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
import jakarta.persistence.*;
import java.util.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.state.StatefulItem;
import org.comixedproject.views.View;

/**
 * <code>ComicBook</code> represents a single digital comic issue.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "comic_books_v4")
@Log4j2
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "comicBookId")
public class ComicBook implements StatefulItem<ComicState> {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "comic_book_id")
  @JsonProperty("comicBookId")
  @JsonView({View.ComicListView.class, View.DuplicatePageList.class, View.ReadingListDetail.class})
  @Getter
  @Setter
  private Long comicBookId;

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

  public boolean isFileContentsLoaded() {
    return !this.comicDetail.isLoadingFileContents();
  }

  public void setFileContentsLoaded(final boolean loaded) {
    this.comicDetail.setLoadingFileContents(!loaded);
  }

  public boolean isUpdateMetadata() {
    return this.comicDetail.isUpdatingMetadata();
  }

  public void setUpdateMetadata(final boolean updating) {
    this.comicDetail.setUpdatingMetadata(updating);
  }

  public boolean isBatchMetadataUpdate() {
    return this.comicDetail.isBatchUpdatingMetadata();
  }

  public void setBatchMetadataUpdate(final boolean updating) {
    this.comicDetail.setBatchUpdatingMetadata(updating);
  }

  public boolean isBatchScraping() {
    return this.comicDetail.isBatchScraping();
  }

  public void setBatchScraping(final boolean scraping) {
    this.comicDetail.setBatchScraping(scraping);
  }

  public boolean isOrganizing() {
    return this.comicDetail.isOrganizing();
  }

  public void setOrganizing(final boolean organizing) {
    this.comicDetail.setOrganizing(organizing);
  }

  public boolean isPurging() {
    return this.comicDetail.isPurging();
  }

  public void setPurging(final boolean purging) {
    this.comicDetail.setPurging(purging);
  }

  public ArchiveType getTargetArchiveType() {
    return this.comicDetail.getTargetArchiveType();
  }

  public void setTargetArchiveType(final ArchiveType targetArchiveTYpe) {
    this.comicDetail.setTargetArchiveType(targetArchiveTYpe);
  }

  public boolean isEditDetails() {
    return this.comicDetail.isEditingMetadata();
  }

  public void setEditDetails(final boolean editDetails) {
    this.comicDetail.setEditingMetadata(editDetails);
  }

  public int getPageCount() {
    return this.comicDetail.getPageCount();
  }

  public List<ComicPage> getPages() {
    return this.comicDetail.getPages();
  }

  public boolean hasPageWithFilename(final String filename) {
    return this.comicDetail.hasPageWithFilename(filename);
  }

  public void updatePageNumbers() {
    this.comicDetail.updatePageNumbers();
  }

  public int getBlockedPageCount() {
    return this.comicDetail.getBlockedPageCount();
  }

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
  @Transient @Getter @Setter private Date lastScrapedDate;

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

  @Override
  @Transient
  public ComicState getState() {
    return this.comicDetail.getComicState();
  }

  @Override
  public void setState(final ComicState state) {
    this.comicDetail.setComicState(state);
  }
}
