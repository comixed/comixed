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
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.*;
import org.comixedproject.views.View;

/**
 * A <code>MetadataSource</code> represents the details for a site that provides comic metadata.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "metadata_sources")
@NoArgsConstructor
@RequiredArgsConstructor
public class MetadataSource {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.MetadataSourceList.class, View.ComicDetailsView.class})
  @Getter
  private Long id;

  @Column(
      name = "adaptor_name",
      length = 64,
      unique = true,
      insertable = true,
      updatable = true,
      nullable = false)
  @JsonProperty("name")
  @JsonView({View.MetadataSourceList.class, View.ComicDetailsView.class})
  @Getter
  @Setter
  @NonNull
  private String adaptorName;

  @Column(name = "preferred_source", insertable = true, updatable = true, nullable = false)
  @JsonProperty("preferred")
  @JsonView({View.MetadataSourceList.class, View.ComicDetailsView.class})
  @Getter
  @Setter
  @NonNull
  private Boolean preferred = false;

  @OneToMany(
      mappedBy = "source",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  @JsonProperty("properties")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  private Set<MetadataSourceProperty> properties = new HashSet<>();

  @Transient
  @JsonProperty("available")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @Setter
  private boolean available = false;

  @Transient
  @JsonProperty("version")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @Setter
  private String version;

  @Transient
  @JsonProperty("homepage")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @Setter
  private String homepage;

  @Override
  public int hashCode() {
    return Objects.hash(adaptorName);
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final MetadataSource that = (MetadataSource) o;
    return adaptorName.equals(that.adaptorName);
  }
}
