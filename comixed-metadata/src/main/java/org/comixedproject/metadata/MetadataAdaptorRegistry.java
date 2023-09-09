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

package org.comixedproject.metadata;

import java.util.List;
import java.util.Optional;
import java.util.ServiceLoader;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.springframework.stereotype.Component;

/**
 * <code>MetadataAdaptorRegistry</code> enables dynamically loading instances of {@link
 * MetadataAdaptor} at runtime.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MetadataAdaptorRegistry {
  /**
   * Returns the list of all available adaptors.
   *
   * @return the adaptor list
   */
  public List<MetadataAdaptorProvider> getAdaptors() {
    final ServiceLoader<MetadataAdaptorProvider> loaders =
        ServiceLoader.load(MetadataAdaptorProvider.class);
    return loaders.stream().map(ServiceLoader.Provider::get).toList();
  }

  /**
   * Returns a single adaptor by name.
   *
   * @param adaptorName the adaptor name
   * @return the adaptor
   * @throws MetadataException if the adaptor does not exist
   */
  public MetadataAdaptor getAdaptor(final String adaptorName) throws MetadataException {
    log.debug("Loading metadata adaptor: {}", adaptorName);
    final Optional<MetadataAdaptorProvider> found =
        this.getAdaptors().stream()
            .filter(adaptor -> adaptor.getName().equals(adaptorName))
            .findFirst();
    if (found.isEmpty()) {
      throw new MetadataException("No such metadata adaptor: " + adaptorName);
    }

    final MetadataAdaptorProvider adaptor = found.get();
    log.debug("Found: {}", adaptor.getName());
    return adaptor.create();
  }
}
