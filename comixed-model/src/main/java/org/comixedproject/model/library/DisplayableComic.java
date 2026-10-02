/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import jakarta.persistence.*;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.views.View;
import org.hibernate.annotations.Formula;

/**
 * <code>DisplayableComic</code> represents the details for a comic that can be displayed in a list.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "displayable_comics_view")
public class DisplayableComic {
  public static final String FIELD_NAME_COMIC_ID = "comicId";
  public static final String FIELD_NAME_STORE_DATE = "storeDate";
  public static final String FIELD_NAME_TAG_VALUE = "value";
  public static final String FIELD_NAME_COMIC_COUNT = "comicCount";
  public static final String FIELD_NAME_COVER_DATE = "coverDate";
  public static final String FIELD_NAME_ADDED_DATE = "addedDate";
  public static final String FIELD_NAME_PAGE_COUNT = "pageCount";
  public static final String FIELD_NAME_SORTABLE_ISSUE_NUMBER = "sortableIssueNumber";
  public static final String FIELD_NAME_COMIC_TYPE = "comicType";
  public static final String FIELD_NAME_COMIC_STATE = "comicState";
  public static final String FIELD_NAME_ARCHIVE_TYPE = "archiveType";
  public static final String FIELD_NAME_PUBLISHER = "publisher";
  public static final String FIELD_NAME_SERIES = "series";
  public static final String FIELD_NAME_VOLUME = "volume";

  @JsonProperty(namespace = "comicId")
  @Id
  @Column(name = "comic_id")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  private Long comicId;

  @JsonProperty(namespace = "referenceId")
  @Column(name = "reference_id")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  private String referenceId;

  @JsonProperty(namespace = "previousIssueId")
  @Formula(
      "(SELECT c.comic_id FROM comics_v4 c WHERE c.series = series AND c.volume = volume AND c.cover_date < cover_date ORDER BY c.cover_date DESC LIMIT 1)")
  @JsonView({View.ComicView.class})
  @Getter
  private Long previousIssueId;

  @JsonProperty(namespace = "nextIssueId")
  @Formula(
      "(SELECT c.comic_id FROM comics_v4 c WHERE c.series = series AND c.volume = volume AND c.cover_date > cover_date ORDER BY c.cover_date ASC LIMIT 1)")
  @JsonView({View.ComicView.class})
  @Getter
  private Long nextIssueId;

  @JsonProperty(namespace = "filename")
  @Column(name = "filename")
  @JsonView({View.ComicView.class})
  @Getter
  private String filename;

  @JsonProperty(namespace = "archiveType")
  @Column(name = "archive_type", columnDefinition = "VARCHAR(4)")
  @JsonView({View.ComicView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ArchiveType archiveType;

  @JsonProperty(namespace = "comicState")
  @Column(name = "comic_state", columnDefinition = "VARCHAR(64)")
  @JsonView({View.ComicView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ComicState comicState;

  @JsonProperty(namespace = "unscraped")
  @Column(name = "is_unscraped")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Boolean unscraped;

  @JsonProperty(namespace = "missing")
  @Column(name = "is_missing")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Boolean missing;

  @JsonProperty(namespace = "comicType")
  @Column(name = "comic_type", columnDefinition = "VARCHAR(32)")
  @JsonView({View.ComicView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ComicType comicType;

  @JsonProperty(namespace = "sortName")
  @Column(name = "sort_Name")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private String sortName;

  @JsonProperty(namespace = "publisher")
  @Column(name = "publisher")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  @Setter
  private String publisher;

  @JsonProperty(namespace = "imprint")
  @Column(name = "imprint")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  @Setter
  private String imprint;

  @JsonProperty(namespace = "series")
  @Column(name = "series")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  @Setter
  private String series;

  @JsonProperty(namespace = "volume")
  @Column(name = "volume")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  @Setter
  private String volume;

  @JsonProperty(namespace = "issueNumber")
  @Column(name = "issue_number")
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  @Getter
  private String issueNumber;

  @JsonProperty(namespace = "sortableIssueNumber")
  @Column(name = "sortable_issue_number")
  @JsonView({View.ComicView.class})
  @Getter
  private String sortableIssueNumber;

  @JsonProperty(namespace = "title")
  @Column(name = "title")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private String title;

  @JsonProperty(namespace = "notes")
  @Column(name = "notes")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private String notes;

  @JsonProperty(namespace = "description")
  @Column(name = "description")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private String description;

  @JsonProperty(namespace = "pageCount")
  @Column(name = "page_count")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Integer pageCount;

  @JsonProperty(namespace = "coverDate")
  @Column(name = "cover_date")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Date coverDate;

  @JsonProperty(namespace = "monthPublished")
  @Column(name = "month_published")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Integer monthPublished;

  @JsonProperty(namespace = "yearPublished")
  @Column(name = "year_published")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Integer yearPublished;

  @JsonProperty(namespace = "storeDate")
  @Column(name = "store_date")
  @JsonView({View.ComicView.class})
  @Getter
  private Date storeDate;

  @JsonProperty(namespace = "addedDate")
  @Column(name = "added_date")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Date addedDate;

  @JsonProperty(namespace = "lastModifiedDate")
  @Column(name = "last_modified_date")
  @JsonView({View.ComicView.class})
  @Getter
  @Setter
  private Date lastModifiedDate;

  @JsonProperty(namespace = "baseFilename")
  @Transient
  @JsonView({View.ComicListView.class, View.DeletedPageListView.class})
  public String getBaseFilename() {
    return FilenameUtils.getName(this.filename);
  }
}
