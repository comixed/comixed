/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Date;
import java.util.Objects;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>FilenameScrapingRule</code> represents a single scraping rule for extracting comic details
 * from a filename.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "filename_scraping_rules")
@NoArgsConstructor
@RequiredArgsConstructor
public class FilenameScrapingRule {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "filename_scraping_rule_id")
  @JsonProperty("filenameScrapingRuleId")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  private Long filenameScrapingRuleId;

  @Column(name = "rule_name", length = 25, nullable = false, updatable = true, unique = true)
  @JsonProperty("name")
  @JsonView(View.FilenameScrapingRuleList.class)
  @NonNull
  @Getter
  @Setter
  private String name;

  @Column(name = "rule", length = 256, nullable = false, updatable = true, unique = true)
  @JsonProperty("rule")
  @JsonView(View.FilenameScrapingRuleList.class)
  @NonNull
  @Getter
  @Setter
  private String rule;

  @Column(name = "priority", nullable = false, updatable = true, unique = true)
  @JsonProperty("priority")
  @JsonView(View.FilenameScrapingRuleList.class)
  @NonNull
  @Getter
  @Setter
  private Integer priority;

  @Column(name = "series_position", nullable = true, updatable = true)
  @JsonProperty("seriesPosition")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private Integer seriesPosition = 1;

  @Column(name = "volume_position", nullable = true, updatable = true)
  @JsonProperty("volumePosition")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private Integer volumePosition = 1;

  @Column(name = "issue_number_position", nullable = true, updatable = true)
  @JsonProperty("issueNumberPosition")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private Integer issueNumberPosition = 1;

  @Column(name = "cover_date_position", nullable = true, updatable = true)
  @JsonProperty("coverDatePosition")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private Integer coverDatePosition = 1;

  @Column(name = "date_format", nullable = true, updatable = true, length = 32)
  @JsonProperty("dateFormat")
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private String dateFormat = "";

  @Column(name = "last_modified_on", nullable = false, updatable = true)
  @Temporal(TemporalType.TIMESTAMP)
  @JsonProperty("lastModifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.FilenameScrapingRuleList.class)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final FilenameScrapingRule that = (FilenameScrapingRule) o;
    return priority == that.priority
        && Objects.equals(name, that.name)
        && Objects.equals(rule, that.rule)
        && Objects.equals(seriesPosition, that.seriesPosition)
        && Objects.equals(volumePosition, that.volumePosition)
        && Objects.equals(issueNumberPosition, that.issueNumberPosition)
        && Objects.equals(coverDatePosition, that.coverDatePosition)
        && Objects.equals(dateFormat, that.dateFormat);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        name,
        rule,
        priority,
        seriesPosition,
        volumePosition,
        issueNumberPosition,
        coverDatePosition,
        dateFormat);
  }
}
