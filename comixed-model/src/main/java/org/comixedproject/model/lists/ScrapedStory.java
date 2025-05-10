/*
 * ComiXed - A digital comic book library management application.
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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import lombok.*;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.views.View;

/**
 * <code>ScrapedStory</code> holds the details for a story scraped from a metadata source.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "scraped_stories")
@NoArgsConstructor
@RequiredArgsConstructor
public class ScrapedStory {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.StoryList.class)
  @Getter
  private Long id;

  @Column(name = "story_name", length = 256, nullable = false, updatable = false)
  @JsonProperty("name")
  @JsonView(View.StoryList.class)
  @Getter
  @NonNull
  private String name;

  @ManyToOne
  @JoinColumn(name = "metadata_source_id", nullable = false, updatable = true)
  @JsonProperty("metadataSource")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private MetadataSource metadataSource;

  @Column(name = "reference_id", length = 32, nullable = false, updatable = true)
  @JsonProperty("referenceId")
  @JsonView({View.ComicListView.class})
  @Getter
  @Setter
  private String referenceId;

  @Column(name = "publisher", length = 128, nullable = false, updatable = false)
  @JsonProperty("publisher")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  @NonNull
  String publisher;

  @OneToMany(mappedBy = "story")
  @OrderColumn(name = "reading_order")
  @JsonProperty("entries")
  @JsonView(View.StoryList.class)
  @Getter
  private List<ScrapedStoryEntry> entries = new ArrayList<>();

  @Column(name = "created_on", nullable = false, updatable = false)
  @JsonProperty("createdOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.StoryList.class)
  @Getter
  private Date createdOn = new Date();

  @Column(name = "last_modified_on", nullable = false, updatable = true)
  @JsonProperty("modifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private Date modifiedOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ScrapedStory story = (ScrapedStory) o;
    return name.equals(story.name) && publisher.equals(story.publisher);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, publisher);
  }
}
