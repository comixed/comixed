/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.model.lists;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Objects;
import lombok.*;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.views.View;

/**
 * <code>StoryEntry</code> represents a single entry in a {@link Story}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "story_entries")
@NoArgsConstructor
@RequiredArgsConstructor
public class StoryEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.StoryList.class)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "story_id", nullable = false, updatable = false)
  @NonNull
  @Getter
  private Story story;

  @Column(name = "story_entry_state", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @NonNull
  @Getter
  @Setter
  private StoryEntryState storyEntryState = StoryEntryState.DEFINED;

  @Column(name = "reading_order", nullable = false, updatable = false)
  @JsonProperty("readingOrder")
  @JsonView(View.StoryList.class)
  @Getter
  private int readingOrder;

  @Column(name = "series", length = 128, nullable = false, updatable = true)
  @JsonProperty("series")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private String series;

  @Column(name = "volume", length = 4, nullable = false, updatable = true)
  @JsonProperty("volume")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private String volume;

  @Column(name = "issue_number", length = 16, nullable = false, updatable = false)
  @JsonProperty("issueNumber")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private String issueNumber;

  @ManyToOne(cascade = CascadeType.DETACH)
  @JoinColumn(name = "comic_book_id", nullable = true, updatable = false)
  @JsonView(View.StoryList.class)
  @JsonProperty("comicBook")
  @Getter
  @Setter
  private ComicBook comicBook;

  @Column(name = "comic_vine_id", nullable = true, updatable = true, unique = true)
  @JsonProperty("comicVineId")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private Integer comicVineId;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final StoryEntry that = (StoryEntry) o;
    return readingOrder == that.readingOrder
        && story.equals(that.story)
        && storyEntryState.equals(that.storyEntryState)
        && series.equals(that.series)
        && volume.equals(that.volume)
        && issueNumber.equals(that.issueNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(story, storyEntryState, readingOrder, series, volume, issueNumber);
  }
}
