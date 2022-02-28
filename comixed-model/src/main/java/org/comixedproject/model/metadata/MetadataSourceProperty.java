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
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>MetadataSourceProperty</code> represents a single property of a {@link MetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "MetadataSourceProperties")
@NoArgsConstructor
@RequiredArgsConstructor
public class MetadataSourceProperty {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "MetadataSourceId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private MetadataSource source;

  @Column(name = "Name", length = 32, insertable = true, updatable = false, nullable = false)
  @JsonProperty("name")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @NonNull
  private String name;

  @Column(name = "Value", length = 255, insertable = true, updatable = true, nullable = true)
  @JsonProperty("value")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @Setter
  @NonNull
  private String value;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final MetadataSourceProperty that = (MetadataSourceProperty) o;
    return name.equals(that.name) && value.equals(that.value);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, value);
  }
}
