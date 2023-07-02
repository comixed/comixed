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

package org.comixedproject.rest.batch;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.batch.BatchProcess;
import org.comixedproject.service.batch.BatchProcessesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>BatchProcessesController</code> provides REST APIs for working with the status of batch
 * processes.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class BatchProcessesController {
  @Autowired private BatchProcessesService batchProcessesService;

  /**
   * Returns the status for all batch processes.
   *
   * @return the status list
   */
  @GetMapping(value = "/api/admin/processes", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  public List<BatchProcess> getAllBatchProcesses() {
    log.info("Getting the status of all batch processes");

    return this.batchProcessesService.getAllBatchProcesses();
  }
}
