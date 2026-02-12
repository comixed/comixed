/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import com.fasterxml.jackson.annotation.JsonView;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.comixedproject.views.View;
import org.springframework.batch.core.job.JobExecution;

/**
 * <code>BatchProcessDetail</code> represents the details for a single batch process.
 *
 * @author Darryl L. Pierce
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class BatchProcessDetail {
  @JsonProperty("jobName")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String jobName;

  @JsonProperty("jobId")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private long jobId;

  @JsonProperty("running")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private boolean running;

  @JsonProperty("status")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String status;

  @JsonProperty("parameters")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private Map<String, String> parameters = new HashMap<>();

  @JsonProperty("createTime")
  @JsonView(View.GenericObjectView.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date createTime;

  @JsonProperty("startTime")
  @JsonView(View.GenericObjectView.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date startTime;

  @JsonProperty("endTime")
  @JsonView(View.GenericObjectView.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date endTime;

  @JsonProperty("lastUpdateTime")
  @JsonView(View.GenericObjectView.class)
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @Getter
  @Setter
  private Date lastUpdateTime;

  @JsonProperty("exitStatus")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String exitStatus;

  @JsonProperty("errors")
  @JsonView(View.GenericObjectView.class)
  @Getter
  @Setter
  private String errors;

  public static BatchProcessDetail from(final JobExecution jobExecution) {
    final BatchProcessDetail result = new BatchProcessDetail();
    result.setJobName(jobExecution.getJobInstance().getJobName());
    result.setJobId(jobExecution.getId());
    jobExecution
        .getJobParameters()
        .forEach(
            parameter ->
                result.getParameters().put(parameter.name(), parameter.value().toString()));
    result.setRunning(jobExecution.isRunning());
    result.setStatus(jobExecution.getStatus().name());
    result.setCreateTime(doConvertToDate(jobExecution.getCreateTime()));
    result.setStartTime(doConvertToDate(jobExecution.getStartTime()));
    result.setEndTime(doConvertToDate(jobExecution.getEndTime()));
    result.setLastUpdateTime(doConvertToDate(jobExecution.getLastUpdated()));
    result.setExitStatus(jobExecution.getExitStatus().getExitCode());
    result.setErrors(jobExecution.getExitStatus().getExitDescription());

    return result;
  }

  private static Date doConvertToDate(final LocalDateTime localDateTime) {
    if (localDateTime == null) return null;
    return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
  }
}
