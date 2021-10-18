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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>Story</code> represents a crossover event or long running story.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "Stories")
@NoArgsConstructor
@RequiredArgsConstructor
public class Story {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.StoryList.class)
  @Getter
  private Long id;

  @Column(name = "Name", length = 256, nullable = false, updatable = false)
  @JsonProperty("name")
  @JsonView(View.StoryList.class)
  @Getter
  @NonNull
  private String name;

  @Column(name = "ComicVineId", nullable = true, updatable = true, unique = true)
  @JsonProperty("comicVineId")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  private Integer comicVineId;

  @Column(name = "StoryState", nullable = false, updatable = true)
  @Enumerated(EnumType.STRING)
  @JsonIgnore
  @Getter
  @Setter
  private StoryState storyState = StoryState.CREATED;

  @Column(name = "Publisher", length = 128, nullable = false, updatable = false)
  @JsonProperty("publisher")
  @JsonView(View.StoryList.class)
  @Getter
  @Setter
  @NonNull
  String publisher;

  @OneToMany(mappedBy = "story")
  @OrderColumn(name = "ReadingOrder")
  @JsonProperty("entries")
  @JsonView(View.StoryList.class)
  @Getter
  private List<StoryEntry> entries = new ArrayList<>();

  @Column(name = "CreatedOn", nullable = false, updatable = false)
  @JsonProperty("createdOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.StoryList.class)
  @Getter
  private Date createdOn = new Date();

  @Column(name = "ModifiedOn", nullable = false, updatable = true)
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
    final Story story = (Story) o;
    return name.equals(story.name) && publisher.equals(story.publisher);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, publisher);
  }
}
