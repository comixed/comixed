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

package org.comixedproject.model.collections;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;

/**
 * <code>Issue</code> represents a single issue for a series and volume.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "issues")
@NoArgsConstructor
@RequiredArgsConstructor
public class Issue {
  @JsonProperty("id")
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @JsonProperty("publisher")
  @Column(name = "publisher", length = 255, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String publisher;

  @JsonProperty("series")
  @Column(name = "series", length = 255, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String series;

  @JsonProperty("volume")
  @Column(name = "volume", length = 4, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String volume;

  @JsonProperty("issueNumber")
  @Column(name = "issue_number", length = 16, nullable = false, unique = false, updatable = false)
  @Getter
  @Setter
  @NonNull
  private String issueNumber;

  @JsonProperty("title")
  @Column(name = "title", length = 128, nullable = true, unique = false, updatable = false)
  @Getter
  @Setter
  private String title;

  @JsonProperty("coverDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Column(name = "cover_date", nullable = true, unique = false, updatable = false)
  @Getter
  @Setter
  private Date coverDate;

  @JsonProperty("storeDate")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Column(name = "store_date", nullable = true, unique = false, updatable = false)
  @Getter
  @Setter
  private Date storeDate;

  @JsonProperty("found")
  @Formula(
      value =
          "(SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM comic_books c WHERE c.id IN (SELECT d.comic_book_id FROM comic_details d WHERE d.publisher = publisher AND d.series = series AND d.volume = volume AND d.issue_number = issue_number))")
  @Getter
  @Setter
  private boolean found;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final Issue issue = (Issue) o;
    return Objects.equals(publisher, issue.publisher)
        && Objects.equals(series, issue.series)
        && Objects.equals(volume, issue.volume)
        && Objects.equals(issueNumber, issue.issueNumber)
        && Objects.equals(title, issue.title)
        && Objects.equals(coverDate, issue.coverDate)
        && Objects.equals(storeDate, issue.storeDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(publisher, series, volume, issueNumber, title, coverDate, storeDate);
  }
}
