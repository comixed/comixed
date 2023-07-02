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

package org.comixedproject.model.batch;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.batch.core.BatchStatus;

/**
 * <code>BatchProcess</code> contains the status for a single batch process.
 *
 * @author Darryl L. Pierce
 */
@AllArgsConstructor
public class BatchProcess {
  @JsonProperty("name")
  @Getter
  private String name;

  @JsonProperty("jobId")
  @Getter
  private Long jobId;

  @JsonProperty("instanceId")
  @Getter
  private Long instanceId;

  @JsonProperty("status")
  @Getter
  private BatchStatus status;

  @JsonProperty("startTime")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  private Date startTime;

  @JsonProperty("endTime")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  private Date endTime;

  @JsonProperty("exitCode")
  @Getter
  private String exitCode;

  @JsonProperty("exitDescription")
  @Getter
  private String exitDescription;
}
