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

import jakarta.persistence.*;
import java.io.File;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.archives.ArchiveType;

/**
 * <code>OrganizingComic</code> represents a comic book that's flagged for organization.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "organizing_comics_view")
public class OrganizingComic implements PublicationDetail {
  @Id
  @Column(name = "comic_book_id")
  @Getter
  private Long comicBookId;

  @Column(name = "comic_detail_id")
  @Getter
  private Long comicDetailId;

  @Column(name = "filename")
  @Getter
  private String filename;

  @Column(name = "archive_type")
  @Enumerated(EnumType.STRING)
  @Getter
  private ArchiveType archiveType;

  @Column(name = "is_scraped")
  @Getter
  private boolean scraped;

  @Column(name = "publisher")
  @Getter
  private String publisher;

  @Column(name = "imprint")
  @Getter
  private String imprint;

  @Column(name = "series")
  @Getter
  private String series;

  @Column(name = "volume")
  @Getter
  private String volume;

  @Column(name = "issue_number")
  @Getter
  private String issueNumber;

  @Column(name = "title")
  @Getter
  private String title;

  @Column(name = "cover_date")
  @Getter
  private Date coverDate;

  @Column(name = "store_date")
  @Getter
  private Date storeDate;

  @Transient @Getter @Setter private String updatedFilename;

  @Transient
  public File getFile() {
    return new File(this.filename);
  }
}
