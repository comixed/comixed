/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.task;

import java.io.File;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.FilenameScraperAdaptor;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicState;
import org.comixedproject.model.scraping.ScrapingRule;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.scraping.ScrapingRuleService;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateHandler;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>AddComicTask</code> handles adding a comic to the library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@ConfigurationProperties(prefix = "comic-file.handlers")
@Log4j2
public class AddComicTask extends AbstractTask {
  @Autowired private ObjectFactory<Comic> comicFactory;
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ComicService comicService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ScrapingRuleService scrapingRuleService;
  @Autowired private FilenameScraperAdaptor filenameScraper;
  @Getter @Setter private String filename;
  @Getter @Setter private boolean deleteBlockedPages = false;
  @Getter @Setter private boolean ignoreMetadata = false;

  public AddComicTask() {
    super(PersistedTaskType.ADD_COMIC);
  }

  @Override
  @Transactional
  public void startTask() throws TaskException {
    log.trace("Adding file to library: {}", this.filename);

    final File file = new File(this.filename);
    Comic result = this.comicService.findByFilename(file.getAbsolutePath());

    if (result != null) {
      log.debug("Comic already imported: " + file.getAbsolutePath());
      return;
    }

    try {
      result = this.comicFactory.getObject();
      log.trace("Setting comic filename");
      result.setFilename(file.getAbsolutePath());
      log.trace("Loading filename scraping rules");
      final List<ScrapingRule> scrapingRuleList = this.scrapingRuleService.getAllRules();
      for (int index = 0; index < scrapingRuleList.size(); index++) {
        if (this.filenameScraper.execute(result, scrapingRuleList.get(index))) break;
      }
      log.trace("Loading comic details");
      this.comicFileHandler.loadComicArchiveType(result);

      log.trace("Setting comic state");
      result.setComicState(ComicState.ADDED);
      log.trace("Saving comic");
      result = this.comicService.save(result);

      log.trace("Fire event: comic imported");
      this.comicStateHandler.fireEvent(result, ComicEvent.imported);
    } catch (Exception error) {
      throw new TaskException("Failed to load comic", error);
    }
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result
        .append("Add comic to library:")
        .append(" filename=")
        .append(this.filename)
        .append(" delete blocked pages=")
        .append(this.deleteBlockedPages ? "Yes" : "No")
        .append(" ignore metadata=")
        .append(this.ignoreMetadata ? "Yes" : "No");

    return result.toString();
  }
}
