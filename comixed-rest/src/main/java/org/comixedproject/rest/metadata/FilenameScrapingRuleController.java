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

package org.comixedproject.rest.metadata;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.FilenameScrapingRule;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>FilenameScrapingRuleController</code> provides REST APIs for working with instances of
 * {@link FilenameScrapingRule}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class FilenameScrapingRuleController {
  @Autowired private FilenameScrapingRuleService filenameScrapingRuleService;

  /**
   * Retrieves the list of filename scraping rules.
   *
   * @return the rules
   */
  @GetMapping(value = "/api/admin/scraping/rules", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.scraping-rules.get-all")
  @JsonView(View.FilenameScrapingRuleList.class)
  public List<FilenameScrapingRule> loadRules() {
    log.info("Loading all filename scraping rules");
    return this.filenameScrapingRuleService.loadRules();
  }

  /**
   * Saves the list of filename scraping rules.
   *
   * @param rules the rules
   * @return the saved rules
   */
  @PostMapping(
      value = "/api/admin/scraping/rules",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.scraping-rules.save")
  @JsonView(View.FilenameScrapingRuleList.class)
  public List<FilenameScrapingRule> saveRules(
      @RequestBody() final List<FilenameScrapingRule> rules) {
    log.info("Saving filename scraping rules");
    return this.filenameScrapingRuleService.saveRules(rules);
  }
}
