/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.model.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.views.View;

/**
 * <code>ConfigurationOption</code> represents a single system-wide configuration option.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ConfigurationOptions")
@NoArgsConstructor
@RequiredArgsConstructor
public class ConfigurationOption {
  public static final String CREATE_EXTERNAL_METADATA_FILE =
      "library.metadata.create-external-files";

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  Long id;

  @Column(name = "Name", length = 64, updatable = false)
  @JsonProperty("name")
  @JsonView(View.ConfigurationList.class)
  @Getter
  @NonNull
  private String name;

  @Column(name = "Value", length = 256, updatable = true)
  @JsonProperty("value")
  @JsonView(View.ConfigurationList.class)
  @Getter
  @Setter
  private String value;

  @Column(name = "LastModifiedOn", nullable = false, updatable = true)
  @JsonProperty("lastModifiedOn")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView(View.ConfigurationList.class)
  @Getter
  @Setter
  private Date lastModifiedOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ConfigurationOption that = (ConfigurationOption) o;
    return Objects.equals(name, that.name) && Objects.equals(value, that.value);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, value);
  }
}
