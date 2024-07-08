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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.extern.log4j.Log4j2;

/**
 * <code>ImageFileTypeContentAdaptorProvider</code> provides an implementation of {@link
 * FileTypeContentAdaptorProvider} for {@link ImageFileTypeContentAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class ImageFileTypeContentAdaptorProvider implements FileTypeContentAdaptorProvider {
  private ImageFileTypeContentAdaptor adaptor = new ImageFileTypeContentAdaptor();
  private List<String> supportedContentTypes =
      new ArrayList<>(Arrays.asList("jpeg", "png", "gif", "webp"));

  @Override
  public FileTypeContentAdaptor create() {
    return adaptor;
  }

  @Override
  public boolean supports(final String contentType) {
    return this.supportedContentTypes.contains(contentType);
  }
}
