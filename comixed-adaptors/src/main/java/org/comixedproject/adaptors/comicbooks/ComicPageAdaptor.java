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

package org.comixedproject.adaptors.comicbooks;

import lombok.extern.log4j.Log4j2;
import org.codehaus.plexus.util.FileUtils;
import org.comixedproject.model.comicpages.Page;
import org.springframework.stereotype.Component;

/**
 * <code>ComicPageAdaptor</code> provides a set of utility methods for naming comic pages.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicPageAdaptor {
  private static final String FORBIDDEN_RULE_CHARACTERS = "[\"':\\\\*?|<>]";

  /**
   * Generates a new filename for the given page.
   *
   * @param page the page
   * @param renamingRule the renaming rule
   * @param pageIndex the page index in the comic
   * @return the page name
   */
  public String createFilenameFromRule(
      final Page page, final String renamingRule, final int pageIndex) {
    log.debug("Scrubbing renaming rule: {}", renamingRule);
    final String rule = this.scrub(renamingRule, FORBIDDEN_RULE_CHARACTERS);

    log.debug("Generating relative filename based on renaming rule: {}", rule);
    final String index = String.valueOf(pageIndex + 1);

    String result = rule.replace("$INDEX", index);

    log.debug("Relative page name: {}", result);

    return String.format("%s.%s", result, FileUtils.getExtension(page.getFilename()));
  }

  private String scrub(final String text, final String forbidden) {
    log.trace("Pre-sanitized text: {}", text);
    return text.replaceAll(forbidden, "_");
  }
}
