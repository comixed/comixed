/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.rest.lists;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.rest.AuditableRestEndpoint;
import org.comixedproject.model.lists.Story;
import org.comixedproject.service.lists.StoryException;
import org.comixedproject.service.lists.StoryService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>StoryController</code> provides REST APIs for working with instances of {@link Story}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class StoryController {
  @Autowired private StoryService storyService;

  /**
   * Retrieves all stories.
   *
   * @return the set of all stories
   */
  @GetMapping(value = "/api/lists/stories/names", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.StoryList.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableRestEndpoint(logResponse = true, responseView = View.StoryList.class)
  public Set<String> loadAllNames() {
    log.info("Getting all stories");
    return this.storyService.loadAll();
  }

  /**
   * Retrieves all stories. If a name is provided then only stories with the given name are
   * returned.
   *
   * @param name the story name
   * @return the stories
   */
  @GetMapping(value = "/api/lists/stories", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.StoryList.class)
  @PreAuthorize("hasRole('READER')")
  @AuditableRestEndpoint(logResponse = true, responseView = View.StoryList.class)
  public Set<Story> loadAllWithName(@RequestParam(value = "name") final String name) {
    log.info("Loading all stories with name: {}", name);
    return this.storyService.findByName(name);
  }

  /**
   * Creates a new story from the provided model.
   *
   * @param story the data model
   * @return the saved story
   * @throws StoryException if an error occurs
   */
  @PostMapping(
      value = "/api/lists/stories",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.StoryDetail.class)
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableRestEndpoint(
      logRequest = true,
      logResponse = true,
      responseView = View.StoryDetail.class)
  public Story createStory(@RequestBody() final Story story) throws StoryException {
    log.info("Creating a new story: name={}", story.getName());
    return this.storyService.createStory(story);
  }
}
