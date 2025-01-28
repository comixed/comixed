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

import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.views.View;

/**
 * <code>DisplayableComic</code> represents the details for a comic that can be displayed in a list.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "displayable_comics_view")
public class DisplayableComic {
  @Id
  @Column(name = "comic_book_id")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private Long comicBookId;

  @Column(name = "comic_detail_id")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private Long comicDetailId;

  @Column(name = "archive_type", columnDefinition = "VARCHAR(4)")
  @JsonView({View.ComicDetailsView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ArchiveType archiveType;

  @Column(name = "comic_state", columnDefinition = "VARCHAR(64)")
  @JsonView({View.ComicDetailsView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ComicState comicState;

  @Column(name = "is_unscraped")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Boolean unscraped;

  @Column(name = "comic_type", columnDefinition = "VARCHAR(32)")
  @JsonView({View.ComicDetailsView.class})
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ComicType comicType;

  @Column(name = "publisher")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private String publisher;

  @Column(name = "series")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private String series;

  @Column(name = "volume")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private String volume;

  @Column(name = "issue_number")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private String issueNumber;

  @Column(name = "sortable_issue_number")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private String sortableIssueNumber;

  @Column(name = "title")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private String title;

  @Column(name = "page_count")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Integer pageCount;

  @Column(name = "cover_date")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Date coverDate;

  @Column(name = "month_published")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Integer monthPublished;

  @Column(name = "year_published")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Integer yearPublished;

  @Column(name = "store_date")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  private Date storeDate;

  @Column(name = "added_date")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Date addedDate;
}
