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

import java.util.List;
import java.util.Optional;
import java.util.ServiceLoader;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * <code>ContentAdaptorRegistry</code> provides a means of finding the correct {@link
 * ContentAdaptor} for an content entry.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ContentAdaptorRegistry {
  public ContentAdaptor getContentAdaptorForFilename(final String filename) {
    log.debug("Looking for a filename adaptor for {}", filename);
    final List<FilenameContentAdaptorProvider> loaders =
        ServiceLoader.load(FilenameContentAdaptorProvider.class).stream()
            .map(ServiceLoader.Provider::get)
            .toList();

    final Optional<FilenameContentAdaptorProvider> provider =
        loaders.stream().filter(entry -> entry.supports(filename)).findFirst();

    if (provider.isPresent()) {
      final FilenameContentAdaptor adaptor = provider.get().create();
      log.debug("Returning an instance of {}", adaptor.getClass().getSimpleName());
      return adaptor;
    }

    log.debug("No filename adaptor found");
    return null;
  }

  public ContentAdaptor getContentAdaptorForContentType(final String contentType) {
    log.debug("Looking for a content type adaptor for {}", contentType);
    final List<FileTypeContentAdaptorProvider> loaders =
        ServiceLoader.load(FileTypeContentAdaptorProvider.class).stream()
            .map(ServiceLoader.Provider::get)
            .toList();

    final Optional<FileTypeContentAdaptorProvider> provider =
        loaders.stream().filter(entry -> entry.supports(contentType)).findFirst();

    if (provider.isPresent()) {
      final FileTypeContentAdaptor adaptor = provider.get().create();
      log.debug("Returning an instance of {}", adaptor.getClass().getSimpleName());
      return adaptor;
    }

    log.debug("No filename adaptor found");
    return null;
  }

  public ContentAdaptor getContentAdaptor(final String filename, final String contentType) {
    ContentAdaptor result = this.getContentAdaptorForFilename(filename);
    if (result == null) {
      result = this.getContentAdaptorForContentType(contentType);
    }
    return result;
  }
}
