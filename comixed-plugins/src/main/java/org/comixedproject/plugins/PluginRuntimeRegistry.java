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

package org.comixedproject.plugins;

import java.util.List;
import java.util.Optional;
import java.util.ServiceLoader;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * <code>PluginRuntimeRegistry</code> enables dynamically loading instances of {@link PluginRuntime}
 * at runtime.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PluginRuntimeRegistry {
  /**
   * Returns the list of all available adaptors.
   *
   * @return the adaptor list
   */
  public List<PluginRuntimeProvider> getPluginRuntimeList() {
    final ServiceLoader<PluginRuntimeProvider> loaders =
        ServiceLoader.load(PluginRuntimeProvider.class);
    return loaders.stream().map(ServiceLoader.Provider::get).toList();
  }

  /**
   * Returns a single language runtime by name.
   *
   * @param name the adaptor name
   * @return the runtime
   * @throws PluginRuntimeException if the adaptor does not exist
   */
  public PluginRuntime getPluginRuntime(final String name) throws PluginRuntimeException {
    log.debug("Loading plugin runtime: {}", name);
    final Optional<PluginRuntimeProvider> found =
        this.getPluginRuntimeList().stream()
            .filter(adaptor -> adaptor.getName().equals(name))
            .findFirst();
    if (found.isEmpty()) {
      throw new PluginRuntimeException("No such plugin runtime: " + name);
    }

    final PluginRuntimeProvider adaptor = found.get();
    log.debug("Found: {}", adaptor.getName());
    return adaptor.create();
  }
}
