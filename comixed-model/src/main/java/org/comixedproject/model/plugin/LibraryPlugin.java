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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.*;
import org.comixedproject.views.View;
import org.hibernate.annotations.ColumnTransformer;

/**
 * <code>LibraryPlugin</code> represents a single installed plugin.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "library_plugins")
@NoArgsConstructor
@RequiredArgsConstructor
public class LibraryPlugin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonProperty("id")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  private Long id;

  @Column(name = "name", length = 64, insertable = true, updatable = false, nullable = false)
  @ColumnTransformer(write = "TRIM(?)")
  @JsonProperty("name")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @NonNull
  private String name;

  @Column(
      name = "unique_name",
      length = 64,
      insertable = true,
      updatable = false,
      nullable = false,
      unique = true)
  @ColumnTransformer(write = "UPPER(TRIM(?))")
  @Getter
  @NonNull
  private String uniqueName;

  @Column(name = "language", length = 32, updatable = false, nullable = false)
  @JsonProperty("language")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @NonNull
  private String language;

  @Column(name = "version", length = 16, updatable = true, nullable = false)
  @JsonProperty("version")
  @JsonView(View.LibraryPluginList.class)
  @ColumnTransformer(write = "TRIM(?)")
  @Getter
  @NonNull
  private String version;

  @Column(name = "filename", length = 1024, nullable = false, updatable = true)
  @JsonProperty("filename")
  @JsonView(View.LibraryPluginList.class)
  @ColumnTransformer(write = "TRIM(?)")
  @Getter
  @NonNull
  private String filename;

  @Column(name = "admin_only", nullable = false)
  @JsonProperty("adminOnly")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  @Setter
  private Boolean adminOnly = true;

  @OneToMany(mappedBy = "plugin", orphanRemoval = true, cascade = CascadeType.ALL)
  @JsonProperty("properties")
  @JsonView(View.LibraryPluginList.class)
  @Getter
  private List<LibraryPluginProperty> properties = new ArrayList<>();

  @Override
  public String toString() {
    return "LibraryPlugin{"
        + "name='"
        + name
        + '\''
        + ", uniqueName='"
        + uniqueName
        + '\''
        + ", language='"
        + language
        + '\''
        + ", version='"
        + version
        + '\''
        + ", filename='"
        + filename
        + '\''
        + ", adminOnly="
        + adminOnly
        + '}';
  }

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final LibraryPlugin libraryPlugin = (LibraryPlugin) o;
    return Objects.equals(name, libraryPlugin.name)
        && Objects.equals(uniqueName, libraryPlugin.uniqueName)
        && Objects.equals(language, libraryPlugin.language)
        && Objects.equals(version, libraryPlugin.version)
        && Objects.equals(filename, libraryPlugin.filename)
        && Objects.equals(adminOnly, libraryPlugin.adminOnly);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, uniqueName, language, version, filename, adminOnly);
  }
}
