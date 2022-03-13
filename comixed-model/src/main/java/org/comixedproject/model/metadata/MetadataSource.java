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
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * A <code>MetadataSource</code> represents the details for a site that provides comic metadata.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "MetadataSources")
@NoArgsConstructor
@RequiredArgsConstructor
public class MetadataSource {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView({View.MetadataSourceList.class, View.MetadataAuditLogEntryList.class})
  @Getter
  private Long id;

  @Column(
      name = "BeanName",
      length = 32,
      unique = true,
      insertable = true,
      updatable = true,
      nullable = false)
  @JsonProperty("beanName")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  @Setter
  @NonNull
  private String beanName;

  @Column(
      name = "Name",
      length = 64,
      unique = true,
      insertable = true,
      updatable = true,
      nullable = false)
  @JsonProperty("name")
  @JsonView({View.MetadataSourceList.class, View.MetadataAuditLogEntryList.class})
  @Getter
  @Setter
  @NonNull
  private String name;

  @OneToMany(
      mappedBy = "source",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  @JsonProperty("properties")
  @JsonView(View.MetadataSourceList.class)
  @Getter
  private Set<MetadataSourceProperty> properties = new HashSet<>();

  @OneToMany(
      mappedBy = "metadataSource",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @JsonProperty("auditLogEntries")
  @JsonView(View.MetadataSourceDetail.class)
  @Getter
  private Set<MetadataAuditLogEntry> auditLogEntries = new HashSet<>();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final MetadataSource that = (MetadataSource) o;
    return name.equals(that.name);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name);
  }
}
