/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

package org.comixedproject.model.plugin;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.Objects;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>LibraryPluginProperty</code> defines a single property for a libraryPlugin.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "library_plugin_properties")
@NoArgsConstructor
@RequiredArgsConstructor
public class LibraryPluginProperty {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne()
  @JoinColumn(name = "library_plugin_id")
  @Getter
  @NonNull
  private LibraryPlugin plugin;

  @Column(name = "property_name", length = 32, updatable = true, nullable = false)
  @JsonProperty("name")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @Setter
  @NonNull
  private String name;

  @Column(name = "property_length", nullable = false)
  @JsonProperty("length")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @Setter
  @NonNull
  private Integer length;

  @Column(name = "property_value", length = 128, updatable = true, nullable = true)
  @JsonProperty("value")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @Setter
  @NonNull
  private String value = "";

  @Override
  public String toString() {
    return "LibraryPluginProperty{"
        + "libraryPlugin="
        + plugin
        + ", name='"
        + name
        + '\''
        + ", value="
        + value
        + '}';
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final LibraryPluginProperty that = (LibraryPluginProperty) o;
    return Objects.equals(id, that.id)
        && Objects.equals(plugin, that.plugin)
        && Objects.equals(name, that.name)
        && Objects.equals(length, that.length)
        && Objects.equals(value, that.value);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, plugin, name, value);
  }
}
