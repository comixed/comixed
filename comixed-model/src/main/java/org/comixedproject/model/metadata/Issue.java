/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.model.metadata;

import java.util.Date;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/**
 * <code>Issue</code> represents a single issue for a series and volume.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Issues")
@NoArgsConstructor
@RequiredArgsConstructor
public class Issue {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "Publisher", length = 255, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String publisher;

  @Column(name = "Series", length = 255, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String series;

  @Column(name = "Volume", length = 4, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String volume;

  @Column(name = "IssueNumber", length = 16, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String issueNumber;

  @Column(name = "CoverDate", nullable = true, unique = false, updatable = false)
  @Getter
  @Setter
  private Date coverDate;

  @Column(name = "StoreDate", nullable = true, unique = false, updatable = false)
  @Getter
  @Setter
  private Date storeDate;

  @Override
  public int hashCode() {
    return Objects.hash(publisher, series, volume, issueNumber, coverDate, storeDate);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Issue issue = (Issue) o;
    return series.equals(issue.publisher)
        && series.equals(issue.series)
        && volume.equals(issue.volume)
        && issueNumber.equals(issue.issueNumber)
        && Objects.equals(coverDate, issue.coverDate)
        && Objects.equals(storeDate, issue.storeDate);
  }
}
