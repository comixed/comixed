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

package org.comixedproject.controller.comic;

import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.messaging.EndOfList;
import org.comixedproject.service.comic.ScanTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * <code>ScanTypeController</code> provides APIs for working with {@link
 * org.comixedproject.model.comic.ScanType}s.
 *
 * @author Darryl L. Pierce
 */
@Controller
@Log4j2
public class ScanTypeController {
  @Autowired private ScanTypeService scanTypeService;
  @Autowired private SimpMessagingTemplate messagingTemplate;

  /**
   * Retrieves the list of all scan types and publishes them.
   *
   * @param principal the user principal
   */
  @MessageMapping(Constants.LOAD_SCAN_TYPES)
  public void getScanTypes(final Principal principal) {
    log.info("Getting all scan types for user: {}", principal.getName());
    this.scanTypeService
        .getAll()
        .forEach(
            scanType -> {
              log.trace("Sending scan type to user: {}", scanType.getName());
              this.messagingTemplate.convertAndSendToUser(
                  principal.getName(), Constants.SCAN_TYPE_UPDATE_TOPIC, scanType);
            });
    this.messagingTemplate.convertAndSendToUser(
        principal.getName(), Constants.SCAN_TYPE_UPDATE_TOPIC, EndOfList.MESSAGE);
  }
}
