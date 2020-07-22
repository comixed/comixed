/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.plugins.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>PluginDescriptor</code> holds the details for a plugin.
 *
 * @author Darryl L. Pierce
 */
@RequiredArgsConstructor
public class PluginDescriptor {
  @NonNull @Getter private Plugin plugin;

  @Getter
  @Setter
  @JsonProperty("name")
  @JsonView(View.PluginList.class)
  private String name;

  @Getter
  @Setter
  @JsonProperty("language")
  @JsonView(View.PluginList.class)
  private String language;

  @Getter
  @Setter
  @JsonProperty("version")
  @JsonView(View.PluginList.class)
  private String version;

  @Getter
  @Setter
  @JsonProperty("author")
  @JsonView(View.PluginList.class)
  private String author;

  @Getter
  @Setter
  @JsonProperty("description")
  @JsonView(View.PluginList.class)
  private String description;

  @Getter @Setter private Map<String, byte[]> entries = new HashMap<>();
}
