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

package org.comixedproject.adaptors.content;

import java.util.regex.Pattern;
import lombok.extern.log4j.Log4j2;

/**
 * <code>ComicInfoXmlFilenameContentAdaptorProvider</code> provides a {@link
 * FilenameContentAdaptorProvider} for {@link ComicInfoXmlFilenameContentAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ComicInfoXmlFilenameContentAdaptorProvider implements FilenameContentAdaptorProvider {
  private Pattern pattern = Pattern.compile(".*ComicInfo.xml", Pattern.CASE_INSENSITIVE);

  @Override
  public FilenameContentAdaptor create() {
    return new ComicInfoXmlFilenameContentAdaptor();
  }

  @Override
  public boolean supports(final String filename) {
    return pattern.matcher(filename).matches();
  }
}
