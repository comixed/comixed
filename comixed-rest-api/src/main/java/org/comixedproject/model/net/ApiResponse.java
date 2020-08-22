/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.model.net;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.views.View;

/**
 * <code>ApiResponse</code> represents a standardized response object for a REST API call.
 *
 * @param <T> the response data
 * @author Darryl L. Pierce
 */
public class ApiResponse<T> {
  @Getter
  @Setter
  @JsonProperty("success")
  @JsonView(View.ApiResponse.class)
  private boolean success;

  @Getter
  @Setter
  @JsonProperty("error")
  @JsonView(View.ApiResponse.class)
  private String error;

  @Getter @Setter @JsonIgnore private Throwable throwable;

  @Getter
  @Setter
  @JsonProperty("result")
  @JsonView(View.ApiResponse.class)
  private T result;
}
