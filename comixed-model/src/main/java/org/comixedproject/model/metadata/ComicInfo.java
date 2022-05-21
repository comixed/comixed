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

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * <code>ComicInfo</code> models the contents of a ComicInfo.xml metadata file.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor
public class ComicInfo {
  @JsonProperty("Title")
  @Getter
  @Setter
  private String title;

  @JsonProperty("Series")
  @Getter
  @Setter
  private String series;

  @JsonProperty("AlternateSeries")
  @Getter
  @Setter
  private String alternateSeries;

  @JsonProperty("Number")
  @Getter
  @Setter
  private String issueNumber;

  @JsonProperty("Volume")
  @Getter
  @Setter
  private String volume;

  @JsonProperty("Summary")
  @Getter
  @Setter
  private String summary;

  @JsonProperty("Notes")
  @Getter
  @Setter
  private String notes;

  @JsonProperty("Year")
  @Getter
  @Setter
  private Integer year;

  @JsonProperty("Month")
  @Getter
  @Setter
  private Integer month;

  @JsonProperty("Writer")
  @Getter
  @Setter
  private String writer;

  @JsonProperty("Penciller")
  @Getter
  @Setter
  private String penciller;

  @JsonProperty("Inker")
  @Getter
  @Setter
  private String inker;

  @JsonProperty("Colorist")
  @Getter
  @Setter
  private String colorist;

  @JsonProperty("Letterer")
  @Getter
  @Setter
  private String letterer;

  @JsonProperty("CoverArtist")
  @Getter
  @Setter
  private String coverArtist;

  @JsonProperty("Editor")
  @Getter
  @Setter
  private String editor;

  @JsonProperty("Publisher")
  @Getter
  @Setter
  private String publisher;

  @JsonProperty("Characters")
  @Getter
  @Setter
  private String characters;

  @JsonProperty("Teams")
  @Getter
  @Setter
  private String teams;

  @JsonProperty("Locations")
  @Getter
  @Setter
  private String locations;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicInfo comicInfo = (ComicInfo) o;
    return Objects.equals(title, comicInfo.title)
        && Objects.equals(series, comicInfo.series)
        && Objects.equals(alternateSeries, comicInfo.alternateSeries)
        && Objects.equals(issueNumber, comicInfo.issueNumber)
        && Objects.equals(volume, comicInfo.volume)
        && Objects.equals(summary, comicInfo.summary)
        && Objects.equals(notes, comicInfo.notes)
        && Objects.equals(year, comicInfo.year)
        && Objects.equals(month, comicInfo.month)
        && Objects.equals(writer, comicInfo.writer)
        && Objects.equals(penciller, comicInfo.penciller)
        && Objects.equals(inker, comicInfo.inker)
        && Objects.equals(colorist, comicInfo.colorist)
        && Objects.equals(letterer, comicInfo.letterer)
        && Objects.equals(coverArtist, comicInfo.coverArtist)
        && Objects.equals(editor, comicInfo.editor)
        && Objects.equals(publisher, comicInfo.publisher)
        && Objects.equals(characters, comicInfo.characters)
        && Objects.equals(teams, comicInfo.teams)
        && Objects.equals(locations, comicInfo.locations);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        title,
        series,
        alternateSeries,
        issueNumber,
        volume,
        summary,
        notes,
        year,
        month,
        writer,
        penciller,
        inker,
        colorist,
        letterer,
        coverArtist,
        editor,
        publisher,
        characters,
        teams,
        locations);
  }
}
